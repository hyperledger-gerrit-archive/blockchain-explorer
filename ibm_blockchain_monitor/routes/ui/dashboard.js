var express = require('express');
var passport = require('passport');

module.exports = function(dbConnectionString, logger, ev, sessionMiddleware) {
	var nano = require('nano')(dbConnectionString);
	var dbNetworks = nano.use(ev.DB_PREFIX + 'networks');
	var middleware = require('../../libs/mine/middleware')(logger, dbConnectionString, ev);
	var app = express();
	var lines = [];
	var crud = {};
	if(process.env.RUN_MODE === 'IBM-BCS') crud = require('../../libs/crud_core_cl.js');
	else crud = require('../../libs/crud_core_fs.js');

	var dashSessionAuth = [];
	if(process.env.RUN_MODE === 'IBM-BCS'){
		dashSessionAuth = [sessionMiddleware, middleware.bluemix_authenticated];
	}
	else if(process.env.RUN_MODE === 'YETI'){
		dashSessionAuth = [middleware.check_basic_auth];
	}

	//CHECK IT OUT
	// [User has no session]
	// Step 1. Bluemix throws user to /vx/dashboard?ace_config=etc
	// Step 2. Receive user, parse ace_config redirect to /vx/dashboard/<instance_id>
	// Step 3. Throw user to Bluemix SSO login
	// Step 4. Receive user from sso, render out welcome/dashboard page. Store PASSPORT PROFILE into session. Do not auth user against network yet.
	// Step 5. User clicks launch link which goes to /vx/network/<network_id>
	// Step 6. Authenticate user against network_id, store NETWORK DATA into session, render monitor page

	// [User has good session]
	// Step 1. Bluemix throws user to /vx/dashboard?ace_config=etc
	// Step 2. Receive user, parse ace_config redirect to /vx/dashboard/<instance_id>
	// Step 4. Rrender out welcome/dashboard page. Store PASSPORT PROFILE into session. Do not auth user against network yet.
	// Step 5. User clicks launch link which goes to /vx/network/<network_id>
	// Step 6. Authenticate user against network_id, , store NETWORK DATA into session, render monitor page

	//parse ace_config from query parameter
	function parse_ace_config(req, res){
		var ace_config = {};
		var version = 'v2';
		if(req.params.id) version = req.params.id;
		try{
			ace_config = JSON.parse(req.query.ace_config);
		}
		catch (err){
			logger.error('Invalid JSON occurred while parsing dashboard.js: ', err);
			lines = [];
			lines.push('The information you sent to access your blockchain was incorrectly formatted: "' + req.query.ace_config + '"');
			res.render('routes/error', {lines: lines, email: middleware.get_ibm_id_email(req), title: 'Error'});
			return;
		}
		res.redirect('/' + version +'/dashboard/' + ace_config.id);					//default to v2 dashboard, it will change later if needed
	}

	//legacy route, parse ace_config and redirect
	app.get('/dashboard.html', function(req, res) {									//route has no auth on purpose!
		parse_ace_config(req, res);
	});

	//parse ace_config and redirect
	app.get('/:id/dashboard', function(req, res) {									//route has no auth on purpose!
		parse_ace_config(req, res);
	});

	//id is either V1 or V2
	app.get('/:id/dashboard/:instance_id', dashSessionAuth, function(req, res) {
		dasboard_handler(req.params.id, req, res);
	});

	//send to sso to authenticated users here
	app.get('/dashboard/authenticate/:instance_id', [sessionMiddleware], function(req, res) {
		var options = 	{
							callbackURL: ev.CONTENT_URL + '/dashboard/authenticate/' + req.params.instance_id,
							//state: 'testing!'
						};
		passport.authenticate('bluemix', options, cb_passport)(req, res, function(e, resp){console.log('?', e, resp);});

		function cb_passport(e, profile){
			req.session.passport = {user: profile};
			req.session.save();
			dasboard_handler('v2', req, res);										//default to v2, redirect later if needed
		}
	});

	//legacy over capacity url
	app.get('/dashboard_exceed_limit.html', function(req, res) {
		res.redirect('/dashboard_exceed_limit');
	});

	//service is over capacity url
	app.get('/dashboard_exceed_limit', function(req, res) {
		if(!res.query || !res.query.ace_config){
			lines = [];
			lines.push('This blockchain does not exist.');
			logger.error('error no ace_config query param in url');
			res.render('routes/error', {lines: lines, debugging: null, email: middleware.get_ibm_id_email(req), title: 'Error'});
			return;
		}
		var ace_config = JSON.parse(req.query.ace_config);
		crud.get_network_by_instance_id(dbNetworks, ace_config.id, function(err, net_doc){
			if (err){																				//can not find network, error out
				lines = [];
				lines.push('This blockchain does not exist.');
				logger.error('error getting network details for the instance dashboard');
				res.render('routes/error', {lines: lines, debugging: null, email: middleware.get_ibm_id_email(req), title: 'Error'});
				return;
			}
			else{
				logger.debug('net_doc.swarm: ' + net_doc.swarm.name);

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
									title: 'No capacity'
								};
					if(net_doc.instance.timestamp) obj.inst_timestamp = net_doc.instance.timestamp;	//pass timestamp of instance provision
					res.render('routes/out_of_capacity', obj);
				});
			}
		});
	});

	//dashboard session work
	function dasboard_handler(dash_ver, req, res){
		logger.debug('dashboard version', dash_ver);

		// ---- Get Network Doc by Instance ID ---- //
		crud.get_network_by_instance_id(dbNetworks, req.params.instance_id, function(err, net_doc){
			if (err){																		//can not find network, error out
				lines = [];
				lines.push('This blockchain does not exist.');
				logger.error('error getting network details for the instance dashboard');
				res.render('routes/error', {lines: lines, debugging: null, email: middleware.get_ibm_id_email(req), title: 'Error'});
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
								csshash: process.env.cachebust_css
							};
				res.render('routes/welcome', obj);
			}
		});
	}
	return app;
};