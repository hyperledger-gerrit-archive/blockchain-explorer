var express 		= require('express');
var bodyParser 		= require('body-parser');
var cookieParser	= require('cookie-parser');
var winston			= require('winston');
var expressWinston 	= require('express-winston');
var http 			= require('http');
var app 			= express();
var passport		= require('passport');
var BlueMixOAuth2Strategy = require('passport-bluemix-obc').BlueMixOAuth2Strategy;
var session			= require('express-session');
var sessionstore 	= require('sessionstore-cloudant');
var url				= require('url');
var cors 			= require('cors');
var compression 	= require('compression');
var packageJson 	= require('./package.json');
var path			= require('path');
var crud = {};
var ev = {};
var sessionMiddleware = {};
var port = process.env.PORT || 3003;								//set port here when running locally

//name of our app
process.env.APP_NAME = 'passenger';

app.options('*', cors());
app.use(cors());
app.use(expressWinston.logger({
	transports: [
		new (winston.transports.Console)({formatter: function(options) {
			return options.meta.req.method + ' ' + options.meta.req.url + ' ' + options.meta.res.statusCode + ' ' +
				options.meta.responseTime + ' ms';
		}})
	],
	ignoreRoute: function (req, res) {
		if (req.method == 'HEAD' && req.path === '/') return true;
		else if(req.path.indexOf('/js/') >= 0 || req.path.indexOf('/fonts/') >= 0 || req.path.indexOf('/css/') >= 0 || req.path.indexOf('/img/') >= 0){
			return true;											//don't spam the logs as much'
		}
		else return false;
	}
}));

var logger = new (winston.Logger)({
	level: 'debug',
	transports: [
		new (winston.transports.Console)({colorize: true}),
	]
});
var misc = require('./libs/misc.js')(logger);

//---------------------
// RUN MODE -  can be 'IBM-BCS' or 'YETI'
//---------------------
if(process.env.RUN_MODE !== 'IBM-BCS' && process.env.RUN_MODE !== 'YETI'){
	logger.error('---------------------------------------------------------');
	logger.error('Error env var RUN_MODE is not valid.  Set to IBM-BCS or YETI', process.env.RUN_MODE);
	logger.error('---------------------------------------------------------\n');
	process.exit();												//shut down everything
}

//---------------------
// Cache Busting Hash
//---------------------
var bust_js = require('./busters_js.json');
var bust_css = require('./busters_css.json');
process.env.cachebust_js= bust_js['public/js/concat/busters_js'];		//i'm just making 1 hash against all js for easier jade implementation
process.env.cachebust_css = bust_css['public/css/singlecsshash'];		//i'm just making 1 hash against all css for easier jade implementation
logger.info('cache busting hash js', process.env.cachebust_js, 'css', process.env.cachebust_css);

//---------------------
// App Setup
//---------------------
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cookieParser());
app.use(compression());
app.use(express.static(__dirname + '/public', {maxAge: '15d'})); 		//setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/../views'); 								//optional since express defaults to CWD/views

// --- Debug Prints --- //
app.use(function(req, res, next){
	if(req.path.indexOf('/admin/js') === -1  && req.path.indexOf('/admin/css') === -1 && req.path.indexOf('/admin/swagger') === -1){
		console.log('------------------------------------------ incoming request ------------------------------------------');
		console.log('New ' + req.method + ' request for', req.url);
	}
	next();
});

//---------------------
// IBM-BCS - set ev from config doc from database
//---------------------
if(process.env.RUN_MODE === 'IBM-BCS'){
	misc.check_starting_envs(process.env);
	ev = {													//defaults env settings
		ZONE: '',											//leave blank (gets replaced below)
		REGION: '',											//leave blank (gets replaced below)
		DB_CONNECTION_STRING: 'https://example.com',		//leave as dummy url
		ENFORCE_BACKEND_SSL: 'true',
		OVERRIDE_CONTENT_URL: '',							//leave blank (gets replaced below)
		COMMIT: '',											//leave blank (gets replaced below)
		DB_PREFIX: '',										//leave blank (gets replaced below)
		VERSION: packageJson.version
	};

	//overwrite ev[key] with env[key] if env[key] exists
	for(var key in ev){
		if(process.env[key]) ev[key] = process.env[key];	//gets replaced here
	}

	//setup crud
	var nano = require('nano')(ev.DB_CONNECTION_STRING);
	var dbConfig = nano.use(ev.DB_PREFIX + 'config');
	crud = require('./libs/crud_core_cl.js');

	// Add the design doc to the database, 2nd param controls if we overwrite! be careful...
	misc.store_json_doc(nano.use(ev.DB_PREFIX + 'networks'), 'network_design_doc.json', true);
	misc.store_json_doc(nano.use(ev.DB_PREFIX + 'config'), 'config_design_doc.json', true);
	misc.store_json_doc(nano.use(ev.DB_PREFIX + 'config'), 'cc_demo_hashes.json', true);

	// ---- Get ENV settings ---- //
	crud.get_env_config(dbConfig, function(err, results){
		if (err){
			logger.error('An error occurred obtaining env configuration:', err, results);
		}
		else{
			ev.ADMIN_LIST = results.admin_list;
			ev.AUTH_CLIENT_SECRET = results.auth_client_secret;
			ev.AUTH_CLIENT_ID = results.auth_client_id;
			ev.SESSION_SECRET = results.session_secret;										//used to generate session hash
			process.env.APP_PASS= results.app2app[process.env.APP_NAME];					//app 2 app basic auth pass

			//---------------------
			// set EV for this ZONE
			//---------------------
			ev.AUTH_URL = results[ev.ZONE][ev.REGION].auth_url;
			ev.X86_NAME = results[ev.ZONE][ev.REGION].x86_name;
			ev.Z_NAME = results[ev.ZONE][ev.REGION].z_name;
			ev.SP_URL = results[ev.ZONE][ev.REGION].sp_url;
			ev.CONTENT_URL = results[ev.ZONE][ev.REGION].content_url;
			ev.DB_PREFIX = results[ev.ZONE][ev.REGION].db_prefix;
			if(ev.OVERRIDE_CONTENT_URL) ev.CONTENT_URL = ev.OVERRIDE_CONTENT_URL;			//when running locally set overide to "http://localhost:3000"
			if(ev.ZONE === 'local') ev.CONTENT_URL = results[ev.ZONE][ev.REGION].content_url + ':' + port;

			//---------------------
			// Session Store
			//---------------------
			var database = url.parse(ev.DB_CONNECTION_STRING);
			var user = database.auth.split(':')[0];
			var pass = database.auth.split(':')[1];
			var cl_port = 80;
			if (database.protocol == 'https:') cl_port = 443;

			var cloudantSessionStore = sessionstore.createSessionStore({
				type: 'couchdb',
				host: database.protocol + '//' + database.hostname,
				port: cl_port,
				dbName: ev.DB_PREFIX + 'sessions',
				options: {
					auth: {
						username: user,
						password: pass
					},
					cache: false
				}
			});
			cloudantSessionStore.on('connect', function() {
				logger.info('Connected to session store successfully!');
			});

			var secure = true;
			if(ev.ZONE === 'local') secure = false;
			sessionMiddleware = session({
				secret: ev.SESSION_SECRET,
				store: cloudantSessionStore,
				saveUninitialized: true,
				resave: true,
				cookie: { secure: false }
			});

			//---------------------
			// Passport - IBM ID SSO
			//---------------------
			passport.use('bluemix', new BlueMixOAuth2Strategy({
				authorizationURL : ev.AUTH_URL + '/login/oauth/authorize',
				tokenURL : ev.AUTH_URL + '/uaa/oauth/token',
				clientID : ev.AUTH_CLIENT_ID,
				scope: 'openid',
				response_type: 'code',
				grant_type: 'client_credentials',
				clientSecret : ev.AUTH_CLIENT_SECRET,
				profileURL: ev.AUTH_URL + '/login/userinfo'
			}, function(accessToken, refreshToken, profile, done) {
				logger.info('Passport authenticated successfully. Profile is: ' + JSON.stringify(profile));
				var user = {
					profile: profile
				};
				done(null, user);
			}));
			passport.serializeUser(function(user, done) {
				logger.info('Serializing user.');
				done(null, user);
			});
			passport.deserializeUser(function(user, done) {
				logger.info('Deserializing user.');
				done(null, user);
			});

			app.use(passport.initialize());
			app.use(passport.session());
			
			// ---- Create Blockchain Configs ---- //
			crud.get_blockchain_configs(dbConfig, function(err, configs) {
				if (err){
					logger.error('An error occurred getting blockchain configuration docs: ', err, configs);
				}
				else{
					logger.info('Found ' + configs.length + ' swarm configurations...');

					// --- x86 OR Z --- //
					var blockchain_configs = [];
					for (var j in configs){
						var bc_config = misc.build_blockchain_config(configs[j], ev);
						blockchain_configs.push(bc_config);
					}

					//gogo app
					start_app(blockchain_configs);
				}
			});
		}
	});
}

//---------------------
// YETI - set ev here
//---------------------
else if(process.env.RUN_MODE === 'YETI'){
	ev = {													//defaults env settings
		ZONE: 'local',
		DB_CONNECTION_STRING: 'https://example.com',		//leave as dummy url
		ENFORCE_BACKEND_SSL: 'false',
		OVERRIDE_CONTENT_URL: '',							//leave blank
		DB_PREFIX: '',										//leave blank
		VERSION: packageJson.version
	};
	crud = require('./libs/crud_core_fs.js');
	app.use(session({secret:'looseLipsSinkTanks?', resave:true, saveUninitialized:true}));
	sessionMiddleware = function(req, res, next){
		next();
	};
	start_app();
}

//---------------------
// Start Server
//---------------------
function start_app(blk_configs){

	// catch errors on non-local zones //
	if(ev.ZONE !== 'local'){
		logger.info('Going to catch errors rather than fall on face');
		process.env.NODE_ENV = 'production';
		process.on('uncaughtException', function (err) {
			logger.error('Caught exception: ' + JSON.stringify(err, null, '\t'));
		});
	}
	else{
		logger.warn('Will not catch errors');
	}

	// allow self signed? //
	if (ev.ENFORCE_BACKEND_SSL === 'false'){
		logger.info('I am not enforcing the backend to have valid SSL certs!');
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
	}

	// --- All Routes here --- //
	app.use('/', require('./routes/ui/monitor.js')(logger, ev.DB_CONNECTION_STRING, ev, sessionMiddleware));
	app.use('/', require('./routes/api/session_auth_apis.js')(ev.DB_CONNECTION_STRING, blk_configs, logger, ev, sessionMiddleware));
	app.use('/', require('./routes/api/open_apis.js')(ev.DB_CONNECTION_STRING, logger, ev, sessionMiddleware));
	app.use('/', require('./routes/ui/dashboard.js')(ev.DB_CONNECTION_STRING, logger, ev, sessionMiddleware));

	http.createServer(app).listen(port, function() {
		logger.debug('-----------------------------------------------------------------------------------');
		logger.info('Starting ' + process.env.APP_NAME.toUpperCase() + ' on Port ' + port + ' - Mode: ' + process.env.RUN_MODE);
		logger.debug('-----------------------------------------------------------------------------------');
	});

	app.head('/', function(req, res) {
		res.end('OK');
	});

	app.get('/', function(req, res) {
		res.send('Passenger is up and running.');
	});

	//---------------------
	// 404 Page
	//---------------------
	app.use(function(req, res, next){
		//respond with html page
		if(req.accepts('html')) {
			res.status(404).render(path.join(__dirname, '/views/routes/error'), {lines: ['404: Page not found :(']});
			return;
		}

		//respond with json
		if(req.accepts('json')) {
			res.status(404).json({error: 'URL not found'});
			return;
		}
	});
}