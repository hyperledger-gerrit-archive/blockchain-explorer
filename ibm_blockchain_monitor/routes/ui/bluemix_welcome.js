var express  	= require('express');
var passport	= require('passport');
var languages 	= require('../../lang/language_picker.js');

module.exports = function(dbConnectionString, logger, ev, sessionMiddleware, crud) {
	var nano = require('nano')(dbConnectionString);
	var dbNetworks = nano.use(ev.DB_PREFIX + 'networks');
	var middleware = require('../../libs/mine/middleware')(logger, dbConnectionString, ev, crud);
	var app = express();
	var lines = [];
	var dashSessionAuth = [];
	if(process.env.RUN_MODE === 'IBM-BCS'){
		dashSessionAuth = [sessionMiddleware, middleware.bluemix_authenticated];
	}
	else if(process.env.RUN_MODE === 'YETI'){
		dashSessionAuth = [middleware.check_basic_auth];
	}

	function build_error_jade_obj(lines, req, debugging){
		return 	{
					lines:lines, 
					lang: languages.get_from_url(req), 
					email: middleware.get_ibm_id_email(req), 
					debugging: debugging,
					title: 'Error'
				};
	}

	//CHECK IT OUT
	// [User has no session]
	// Step 1. Bluemix throws user to /en-us/vx/dashboard?ace_config=etc
	// Step 2. Receive user, parse ace_config redirect to /en-us/vx/dashboard/<instance_id>
	// Step 3. Throw user to Bluemix SSO login
	// Step 4. Receive user from sso, render out welcome page. Store PASSPORT PROFILE into session. Do not auth user against network yet.
	// Step 5. User clicks launch link which goes to /en-us/vx/network/<network_id>
	// Step 6. Authenticate user against network_id, store NETWORK DATA into session, render monitor page

	// [User has good session]
	// Step 1. Bluemix throws user to /en-us/vx/dashboard?ace_config=etc
	// Step 2. Receive user, parse ace_config redirect to /en-us/vx/dashboard/<instance_id>
	// Step 4. Rrender out welcome/dashboard page. Store PASSPORT PROFILE into session. Do not auth user against network yet.
	// Step 5. User clicks launch link which goes to /en-us/vx/network/<network_id>
	// Step 6. Authenticate user against network_id, , store NETWORK DATA into session, render monitor page

	//parse ace_config from query parameter
	function parse_ace_config(req, res){
		var ace_config = {};
		var lang = languages.get_from_url(req);
		var version = 'v2';				//default value
		if(req.params.id) version = req.params.id;
		var language = 'en-us';			//default value
		if(req.params.lang) language = lang;
		try{
			ace_config = JSON.parse(req.query.ace_config);
		}
		catch (err){
			logger.error('Invalid JSON occurred while parsing in bluemix_welcome.js: ', err);
			lines = [];
			lines.push(lang.format_error_msg + ': "' + req.query.ace_config + '"');
			res.render('routes/error', build_error_jade_obj(lines, req, null));
			return;
		}
		res.redirect('/' + language + '/' + version +'/dashboard/' + ace_config.id); //default to v2 dashboard, it will change later if needed
	}

	//legacy no language in url
	app.get('/:id/dashboard', function(req, res) {							//route has no auth on purpose!
		parse_ace_config(req, res);
	});

	//parse ace_config and redirect
	app.get('/:lang/:id/dashboard', function(req, res) {					//route has no auth on purpose!
		parse_ace_config(req, res);
	});

	//id is either V1 or V2
	app.get('/:lang/:id/dashboard/:instance_id', dashSessionAuth, function(req, res) {
		dasboard_handler(req.params.id, req, res);
	});

	//send to sso to authenticated users here
	app.get('/:lang/:id/dashboard/authenticate/:instance_id', [sessionMiddleware], function(req, res) {
		/*var options = 	{
							callbackURL: ev.CONTENT_URL + '/' + req + '/' + req.params.id + '/dashboard/authenticate/' + req.params.instance_id,
							//state: 'testing!'
						};
		passport.authenticate('bluemix', options, cb_passport)(req, res, function(e, resp){console.log('?', e, resp);});

		function cb_passport(e, profile){
			req.session.passport = {user: profile};
			req.session.save();
			dasboard_handler('v2', req, res);										//default to v2, redirect later if needed
		}*/

		//to do dsh put the above back into place
		req.session.passport = 	{
									user: {
										profile: {
											email: 'test@us.ibm.com',
											_json:{
												user_id: 'test@us.ibm.com'
											}
										}
									}
								};
		//req.session.save();
		//dasboard_handler('v2', req, res);
		res.redirect('/' + req.params.lang + '/' + req.params.id + '/dashboard/' + req.params.instance_id);	//to do dsh remove this
	});

	//service is over capacity url
	app.get('/:lang/:id/dashboard_exceed_limit', function(req, res) {
		var lang = languages.get_from_url(req);
		if(!res.query || !res.query.ace_config){
			lines = [];
			lines.push(lang.network_does_not_exist);
			logger.error('error no ace_config query param in url');
			res.render('routes/error', build_error_jade_obj(lines, req, null));
			return;
		}
		var ace_config = JSON.parse(req.query.ace_config);

		// ---- Get Network Doc by Instance ID ---- // 
		crud.get_network_by_instance_id(dbNetworks, ace_config.id, function(err, net_doc){
			if (err){																				//can not find network, error out
				lines = [];
				lines.push(lang.network_does_not_exist);
				lines.push(lang.id + ': ' + ace_config.id);											//used for debug/support
				logger.error('error getting network doc from an instance id');
				res.render('routes/error', build_error_jade_obj(lines, req, null));
				return;
			}
			else{
				logger.debug('net_doc.swarm: ' + net_doc.swarm.name);

				// ---- Get Pool Count/Stats ---- //
				crud.get_network_stats(dbNetworks, net_doc.swarm.name, function (err, results) {	//grab num of open/used networks
					var inPool = 0;
					if(err != null){
						logger.error('error with get_network_stats()', err, results);
					}
					else{
						if(results[net_doc.swarm.name] && results[net_doc.swarm.name]['in_pool'] && results[net_doc.swarm.name]['in_pool']['valid']){
							inPool = results[net_doc.swarm.name]['in_pool']['valid'];
						}
					}

					var obj = 	{
									environment: ev,
									exceeded_limit: 'yes',
									inst_timestamp: 0,
									inPool: inPool,
									title: lang.error,
									lang: lang
								};
					if(net_doc.instance.timestamp) obj.inst_timestamp = net_doc.instance.timestamp;	//pass timestamp of instance provision
					res.render('routes/out_of_capacity', obj);
				});
			}
		});
	});

	//dashboard session work
	function dasboard_handler(dash_ver, req, res){
		var lang = languages.get_from_url(req);
		logger.debug('dashboard version', dash_ver);

		// ---- Get Network Doc by Instance ID ---- //
		crud.get_network_by_instance_id(dbNetworks, req.params.instance_id, function(err, net_doc){
			if (err){																		//can not find network, error out
				lines = [];
				lines.push(lang.network_does_not_exist);
				lines.push(lang.id + ': ' + req.params.instance_id);						//used for debug/support
				logger.error('error getting network doc from an instance id');
				res.render('routes/error', build_error_jade_obj(lines, req, null));
				return;
			}
			else{
				logger.info('Got network details for the instance dashboard', net_doc._id, ' Looking up this user\'s orgs.');
				var obj = 	{																//object for welcome page
								environment: ev, 
								dash_ver: dash_ver, 
								email: middleware.get_ibm_id_email(req),
								network_id: net_doc._id, 
								debugging: net_doc._id,
								instance_id: req.params.instance_id,
								csshash: process.env.cachebust_css,
								jshash: process.env.cachebust_js,
								lang: lang
							};
				res.render('routes/welcome', obj);
			}
		});
	}
	return app;
};