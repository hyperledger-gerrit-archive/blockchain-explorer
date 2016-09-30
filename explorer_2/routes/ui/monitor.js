var express 	= require('express');
var fs 			= require('fs');
var languages 	= require('../../lang/language_picker.js');

module.exports = function(logger, dbConnectionString, ev, sessionMiddleware, crud) {
	var app = express();
	var dashSessionAuth = [];
	var middleware = require('../../libs/mine/middleware')(logger, dbConnectionString, ev, crud);
	if(process.env.RUN_MODE === 'IBM-BCS'){
		dashSessionAuth = [sessionMiddleware, middleware.enforce_dash_session];
	}
	else if(process.env.RUN_MODE === 'YETI'){
		dashSessionAuth = [middleware.check_basic_auth];
	} 

	//shorter network id for title bar
	function short_net(network_id){
		var ret = '';
		if(network_id) ret = network_id.substr(0,5) + '..';
		return ret;
	}

	//build obj to pass to jade
	function build_jade_obj(req){
		var language = languages.get_from_url(req);
		if(!req.session || !req.session.network_ids || !req.session.network_ids[req.params.network_id]) {
			return {															//fallback... code should not actually get here, just in case
					show_getting_started: false,
					network_id: false,
					display_name: '?',
					title: language.network + ' · ?',
					dash_ver: 'v2',
					jshash: process.env.cachebust_js,
					csshash: process.env.cachebust_css,
					elk: false,
					ZONE: ev.ZONE,
					RUN_MODE: process.env.RUN_MODE,
					swarm_name: '',
					swarm_arch: '',
					swarm_region: '',
					timestamp: 0,
					broker_ver: '?',
					run_mode: process.env.RUN_MODE,
					ui_options:{
						actions: false,
						status_tab: true,
						reset: false,
						chaincode_table: false,
						api_enroll_ids: false,
						support_ticket: true,
					},
					lang: language
				};
		}

		var dash_ver = 'v2';													//init
		if(req.params.id) dash_ver = req.params.id;
		
		var broker_ver = '?';													//init
		if(req.session.network_ids[req.params.network_id].broker_ver) broker_ver = req.session.network_ids[req.params.network_id].broker_ver;
		
		var ui_actions = true;
		if(req.session.network_ids[req.params.network_id].swarm_name === 'yeti' || req.session.network_ids[req.params.network_id].swarm_nam === 'us_south_x86'){
			ui_actions = false;													//old networks and yeti do not have ui actions
		}

		var status_tab = true;
		if(req.session.network_ids[req.params.network_id].swarm_name === 'yeti' || req.session.network_ids[req.params.network_id].swarm_nam === 'us_south_z'){
			status_tab = false;													//z networks and yeti do not have status tab actions
		}

		var enable_reset = false;
		if(req.session.network_ids[req.params.network_id].swarm_nam === 'us_south_z'){
			enable_reset = true;												//only z networks have reset
		}

		var cc_api = true;
		var api_enroll_ids = true;
		var support_ticket = true;
		if(req.session.network_ids[req.params.network_id].swarm_name === 'yeti'){
			cc_api = false;														//yeti networks have no chaincode list api
			api_enroll_ids = false;												//yeti networks have no enrollID/secrets for api tab
			support_ticket = false;
		}

		return 	{
					show_getting_started: req.session.show_getting_started,
					network_id: req.params.network_id,
					display_name: req.session.network_ids[req.params.network_id].display_name,
					title: language.network + ' · ' + short_net(req.params.network_id),
					dash_ver: dash_ver,
					jshash: process.env.cachebust_js,
					csshash: process.env.cachebust_css,
					elk: req.session.network_ids[req.params.network_id].elk,
					ZONE: ev.ZONE,
					RUN_MODE: process.env.RUN_MODE,
					swarm_name: req.session.network_ids[req.params.network_id].swarm_name,
					swarm_arch: req.session.network_ids[req.params.network_id].swarm_arch,
					swarm_region: req.session.network_ids[req.params.network_id].swarm_region,
					timestamp: req.session.network_ids[req.params.network_id].timestamp,		//network creation timestamp
					broker_ver: broker_ver,
					run_mode: process.env.RUN_MODE,
					ui_options:{
						actions: ui_actions,
						status_tab: status_tab,
						reset: enable_reset,
						cc_api: cc_api,
						api_enroll_ids: api_enroll_ids,
						support_ticket: support_ticket,
					},
					lang: language
				};
	}

	//---------------------------------------------------------------------------------------------
	// Routes 
	//---------------------------------------------------------------------------------------------

	// ------------ Network Tab (peers) -------------- //
	app.get('/:lang/:id/network/:network_id', dashSessionAuth, function(req, res, next) {
		if(req.params.id !== 'v1' && req.params.id !== 'v2') next();
		else{
			logger.debug('Network tab - network id is: ' + req.params.network_id, req.params.id);
			res.render('routes/z_single_page_app', build_jade_obj(req));
		}
	});
	
	// ------------ Logs Tab -------------- //
	app.get('/:lang/:id/logs/:network_id', dashSessionAuth, function(req, res, next) {
		if(req.params.id !== 'v1' && req.params.id !== 'v2') next();
		else{
			res.render('routes/z_single_page_app', build_jade_obj(req));
		}
	});
	
	// ------------ Blockchain Tab -------------- //
	app.get('/:lang/:id/blockchain/:network_id', dashSessionAuth, function(req, res, next) {
		if(req.params.id !== 'v1' && req.params.id !== 'v2') next();
		else{
			res.render('routes/z_single_page_app', build_jade_obj(req));
		}
	});
	
	// ------------ API Tab -------------- //
	app.get('/:lang/:id/apis/:network_id', dashSessionAuth, function(req, res, next) {
		if(req.params.id !== 'v2') next();
		else{
			logger.debug('API tab - network id is: ' + req.params.network_id, req.params.id);
			res.render('routes/tab_apis', build_jade_obj(req));
		}
	});
	
	// ------------ Demo Tab (examples/templates) -------------- //
	app.get('/:lang/:id/demo/:network_id', dashSessionAuth, function(req, res, next) {
		if(req.params.id !== 'v2') next();
		else{
			res.render('routes/z_single_page_app', build_jade_obj(req));
		}
	});
	
	// ------------ Support Tab (contact us / status) -------------- //
	app.get('/:lang/:id/support/:network_id', dashSessionAuth, function(req, res, next) {
		if(req.params.id !== 'v1' && req.params.id !== 'v2') next();
		else{
			res.render('routes/z_single_page_app', build_jade_obj(req));
		}
	});

	// ------------ Service Status Tab -------------- //
	app.get('/:lang/:id/service/:network_id', dashSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			if(req.params.id !== 'v1' && req.params.id !== 'v2') next();
			else{
				res.render('routes/z_single_page_app', build_jade_obj(req));
			}
		}
	});

	// ------------ Log Out -------------- //
	app.get('/:lang/logout', dashSessionAuth, function(req, res, next) {
		req.session.destroy();
		res.render('routes/logout', build_jade_obj(req));
	});

	//--------------------------------
	// YETI APIs 
	//--------------------------------
	//yeti api - setup page
	app.get('/setup', function(req, res, next) {
		res.redirect('/en-us/setup');
	});

	//yeti api - setup page
	app.get('/:lang/setup', dashSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'IBM-BCS') next();
		else{
			fs.readFile('./json_docs/yeti_network_doc.json', function (err, net_doc) {
				var obj = build_jade_obj(req);
				obj.title = 'Setup';
				try{
					net_doc = JSON.parse(net_doc);
					obj.network_id = net_doc._id;

				}
				catch(e) {
					net_doc = null;
				}
				obj.net_doc = net_doc;
				res.render(__dirname + '../../../views/routes/yeti_setup.jade', obj);
			});
		}
	});
	
	return app;
};
