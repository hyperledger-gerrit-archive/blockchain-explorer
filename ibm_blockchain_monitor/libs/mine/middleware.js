var basicAuth	= require('basic-auth');
var request 	= require('request');

module.exports = function(logger, dbConnectionString, ev) {
	var exports = {};
	var nano = require('nano')(dbConnectionString);
	var dbNetworks = nano.use(ev.DB_PREFIX + 'networks');
	var crud = {};
	if(process.env.RUN_MODE === 'IBM-BCS') crud = require('../../libs/crud_core_cl.js');
	else crud = require('../../libs/crud_core_fs.js');

	//---------------------------------------------------------------------------------------------
	// IBM ID SSO User Auth
	//---------------------------------------------------------------------------------------------
	exports.bluemix_authenticated = function (req, res, next) {
		logger.debug('Reloading the session... 2');
		req.session.reload(function(err) {
			if (err){
				logger.error('Error reloading the session 2 ' + err);
				req.session.reload(function(err) {
					check_bluemix_auth(req, res, next);
				});
			}
			else{
				check_bluemix_auth(req, res, next);
			}
		});
	};
	
	function check_bluemix_auth(req, res, next) {
		// ---- No Session ---- //
		if (req.session == null || req.session.passport == null || req.session.passport.user == null || req.session.passport.user.profile == null) {
			logger.warn('Could not find session data for user...', req.session.passport);
			logger.info('redirecting to sso...');																//redirect to bluemix sso login
			setTimeout(function(){ res.redirect('/dashboard/authenticate/' + req.params.instance_id); }, 1500);	//use delay in case session saving is slow
		}

		// ---- Okay ---- //
		else{
			logger.debug('User is authenticated.');																//all good, continue
			next();
		}
	}
	
	//---------------------------------------------------------------------------------------------
	// Enforce User's Session - use this function to check user's permissions against API request
	//---------------------------------------------------------------------------------------------
	exports.enforce_users_session = function(req, res, next){
		var network_id = req.params.network_id;

		//sometimes given peer id of network
		if(req.params.peer_id){
			var pos = req.params.peer_id.indexOf('_');
			network_id = req.params.peer_id.substring(0, pos);
		}
		logger.debug('Reloading the session... 42');

		// ---- Reload Session ---- //
		req.session.reload(function(err) {
			if(err){
				logger.error('Error reloading the session 42: ' + err);
				res.status(500).json({error: 'could not reload session'});
				return;
			}
			else{
				if(network_id){
					if(network_id.trim) network_id = network_id.trim();
					if(req.session && req.session.hasOwnProperty('network_ids')) {
						if(req.session.admin === true){										//ok admin
							logger.debug('its an admin');
							next();
						}
						else if(req.session.network_ids[network_id]){						//ok user
							logger.debug('its a normal user');
							next();
						}
						else{																//invalid user
							logger.debug('net in param', network_id, 'nets in session', req.session.network_ids);
							logger.warn('Denied access to user, session was: ' + JSON.stringify(req.session));
							res.status(403).json({error: 'user cannot interact with this network'});
							return;
						}
					}
					else {																	//invalid session
						if(req.session) logger.warn('missing session data, denied access to user, session was: ', req.session.network_ids);
						else logger.warn('missing session, denied access to user, session was: ', req.session);
						res.status(403).json({error: 'user must login for this api'});
						return;
					}
				}
				else{
					res.status(500).json({error: 'no network_id provided'});				//invalid inputs to function
					return;
				}
			}
		});
	};


	//safely get ibm id email from passport session
	exports.get_ibm_id_email = function(req){
		var ret = false;
		if(req && req.session && req.session.passport && req.session.passport.user){
			if(req.session.passport.user.profile && req.session.passport.user.profile.email){
				ret = req.session.passport.user.profile.email;
			}
		}
		return ret;
	};

	//safely get ibm id from passport session
	exports.get_ibm_id = function(req){
		var ret = false;
		if(req && req.session && req.session.passport && req.session.passport.user){
			if(req.session.passport.user.profile && req.session.passport.user.profile._json){
				if( req.session.passport.user.profile._json.user_id){
					ret = req.session.passport.user.profile._json.user_id;
				}
			}
		}
		return ret;
	};

	//---------------------------------------------------------------------------------------------
	// Enforce User's Session for Dashboard - use this function to check user's permissions against session
	//---------------------------------------------------------------------------------------------
	exports.enforce_dash_session = function(req, res, next){
		if(req.params.id !== 'v1' && req.params.id !== 'v2') next();			//this is not one of us
		else {
			logger.info('Reloading the session... dashboard');
			var lines = [];

			// ---- Get Session ---- //
			req.session.reload(function(err){
				if(err || req.session == null){						//there is no session yet or its f'd, send them to get one
					crud.get_network_by_id(dbNetworks, req.params.network_id, function(e, net_doc){
						
						// ---- Cannot Get Session or Network ---- // [error out]
						if(e || !net_doc.instance || !net_doc.instance.instance_id){
							logger.warn('Denied access to monitor ui: 1', req.params.network_id, e);
							lines = [];
							lines.push('Network does not exist');
							res.render('routes/error', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
							return;
						}

						// ---- No Session ---- // [go get one]
						else{
							logger.warn('Non-existant or invalid session for monitor ui, redirecting');
							res.redirect('/v2/dashboard/' + net_doc.instance.instance_id);
							return;
						}
					});
				}
				else{																	//user has got past sso, but session is incomplete

					// --- Inspect Network --- //
					crud.get_network_by_id(dbNetworks, req.params.network_id, function(e, net_doc){
						if(e){
							logger.warn('Denied access to monitor ui: 2', req.params.network_id, e);
							lines = [];
							lines.push('Network does not exist');
							res.render('routes/error', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
							return;
						}

						// ---- Deny Access to Malformed ---- // [error out]
						else if(!net_doc || !net_doc._id || !net_doc.instance || !net_doc.instance.instance_id){//something is off, error out
							logger.warn('Denied access to monitor ui: 3', req.params.network_id, net_doc);
							lines = [];
							lines.push('Network does not exist');
							res.render('routes/out_of_capacity', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
							return;
						}

						// ---- Deny Access to Deleted ---- // [error out]
						else if(net_doc.deleted){																//network is deleting, error out
							logger.warn('Denied access to monitor ui: 4', req.params.network_id, net_doc);
							lines = [];
							lines.push('Network was deleted');
							res.render('routes/error', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
							return;
						}

						// ---- Double Check User's Access ---- //so session is either not yet set, or user doesn't  have access, lets find out
						if(!req.session.hasOwnProperty('network_ids') || !req.session.network_ids[req.params.network_id]){
							exports.lookup_spaces_by_user(exports.get_ibm_id(req), function(err, spaces){
								var has_space_rights = false;

								// --- Check if User is Admin --- //
								for(var k in ev.ADMIN_LIST){
									if(ev.ADMIN_LIST[k] === exports.get_ibm_id_email(req)){						//user is admin?
										has_space_rights = true;
										req.session.admin = true;
										break;
									}
								}

								//testing
								has_space_rights = true; // to do dsh remove this!!!!
								//testing

								// --- Check User's Bluemix Rights --- //
								for(var i in spaces){
									if(spaces[i].guid === net_doc.instance.space_guid){ 
										has_space_rights = true;
										break;
									}
								}

								// ---- Deny Access ---- // [error out]
								if(!has_space_rights){
									logger.warn('Denied access to monitor ui.  allowed:', req.session.network_ids,  req.params.network_id);
									lines = [];
									lines.push('You don\'t have access to this dashboard, or your session has expired.');
									lines.push('Use the service tile on Bluemix to reach the correct dashboard.');
									res.render('routes/error', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
									return;
								}

								// ---- Allow Access ---- // [ok]
								else{
									exports.set_session_data(req, net_doc);									//all the important stuff is set here!
									var dash_ver_err = check_dashboard_version(req, net_doc);				//returns null if pointing to correct dashboard
									if(dash_ver_err != null) res.redirect('/' + dash_ver_err + '/network/' + req.params.network_id);
									else{
										update_dashboard_activity(req, res, net_doc);
										req.session.save();
										next();																//double check found the correct auth for user
									}
								}
							});
						}

						// ---- Allow Access ---- // [ok]
						else{
							var dash_ver_err = check_dashboard_version(req, net_doc);						//returns null if pointing to correct dashboard
							if(dash_ver_err != null) res.redirect('/' + dash_ver_err + '/network/' + req.params.network_id);
							else{
								update_dashboard_activity(req, res, net_doc);
								req.session.save();
								next();																		//double check found the correct auth for user
							}																				//session all good, continue
						}
					});
				}
			});
		}
	};

	//store current timestamp to indicate user has hit dashboard
	function update_dashboard_activity(req, res, net_doc){
		if(!net_doc.instance.prev_dashboard_act) req.session.show_getting_started = true;
		else req.session.show_getting_started = false;

		net_doc.instance.prev_dashboard_act = Date.now();												//todaaaaaaaaaaaaay!
		crud.update_network_doc(dbNetworks, net_doc, function(err, resp){								//we don't wait for this
			if(err != null) logger.error('error updating dashboard activity in doc', resp);
			else logger.log('updated dashboard activity');
		});
	}

	//find if route is for correct dashboard version [v1/v2]
	function check_dashboard_version(req, net_doc){
		var ret = null;
		var dash_ver = 'v2';																			//default dashboard version
		if(net_doc.timestamp < 1461776423000) dash_ver = 'v1';											//date of dashboard v2 roll out
		
		if(dash_ver != req.params.id){
			logger.warn('user is on wrong dashboard, requested:', req.params.id, ' correct:', dash_ver);
			ret = dash_ver;
		}
		return ret;
	}

	//---------------------------------------------------------------------------------------------
	// Get ALL space guids for this user
	//---------------------------------------------------------------------------------------------
	exports.lookup_spaces_by_user = function(userGuid, callback){
		var lookupURL = ev.SP_URL + '/v2/users/' + userGuid + '/spaces/serviceprovidersummary';
		request.get(lookupURL, function(error, response, body) {
			if(error) callback(error, response);
			else {
				var json = {};
				try{
					json = JSON.parse(body);
					callback(null, json);
				}
				catch(e){
					callback({error: 'cannot parse response from bluemix api'}, null);
				}
			}
		}).auth(ev.AUTH_CLIENT_ID, ev.AUTH_CLIENT_SECRET);
	};

	//---------------------------------------------------------------------------------------------
	// Set Session for User
	//---------------------------------------------------------------------------------------------
	exports.set_session_data = function(req, net_doc){
		if(net_doc){
			var display_name = 'Starter Network ID';								//x86 networks name
			if(net_doc.swarm && net_doc.swarm.name === ev.Z_NAME) display_name = 'High Security Business Network ID';

			if(!req.session.network_ids) req.session.network_ids = {};				//create obj of all networks that are okay
			req.session.network_ids[net_doc._id] = {								//store everything about the network here
				display_name: display_name,											// - name of plan for UI, displayed in top right
				swarm_name: null,													// - swarm name is swarm.name
				swarm_arch: null,													// - swarm arch is swarm.arch
				swarm_region: null,													// - swarm region is swarm.region
				elk: false,															// - z networks should set elk to false
				timestamp: net_doc.timestamp,										// - timestamp of network creation
				broker_ver: net_doc.broker_ver										// - service broker verison of network creation 
			};
			if(net_doc.swarm){														//null safe, populate obj
				req.session.network_ids[net_doc._id].swarm_name = net_doc.swarm.name;
				req.session.network_ids[net_doc._id].swarm_arch = net_doc.swarm.arch;
				req.session.network_ids[net_doc._id].swarm_region = net_doc.swarm.swarm_region;
			}
			/*if(net_doc.swarm && net_doc.swarm.arch === 'x86' && ev.ZONE !== 'prod') {//never elk for prod
				req.session.network_ids[net_doc._id].elk = net_doc.instance.elk; 	//x86 get elk
			}*/
		}
	};


	//---------------------------------------------------------------------------------------------
	// YETI - Enforce Basic Auth
	//---------------------------------------------------------------------------------------------
	exports.check_basic_auth = function(req, res, next){
		var lines = [];
		function unauthorized(res) {
			res.set('WWW-Authenticate', 'Basic realm=YetiRealm');
			return res.sendStatus(401);
		}
		if(process.env.RUN_MODE === 'IBM-BCS') next();
		else {
			crud.get_network_by_id(null, req.params.network_id, function(err, net_doc){
				if(err){
					logger.warn('error finding network document, may not exist yet');
					if(req.url !== '/api/network' && req.url !== '/setup'){
						lines.push('Network does not exist');
						res.render('routes/error', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
						return;
					}
					else{
						return next();			//no doc no problem if going to url /setup or POST /api/network
					}
				}
				else{
					//don't check for network id mistmatch if requesting /api/network OR /setup'
					if(req.url !== '/api/network' && req.url !== '/setup' && net_doc._id !== req.params.network_id){
						logger.warn('netork id mismatch, id in doc does not match id in url', req.params.network_id, net_doc._id);
						lines.push('Network does not exist');
						res.render('routes/error', {lines:lines, email: exports.get_ibm_id_email(req), title: 'Error'});
						return;
					}

					//check if basic auth is required
					else{
						exports.set_session_data(req, net_doc);
						req.session.save();

						var bauth = basicAuth(req);
						if(err) return next();																		//doc error 		- let them through
						else if(net_doc.auth === false) return next();												//no auth required	- let them through
						else {
							//[check basic auth]
							logger.debug('checking basic auth');
							if(!bauth || !bauth.name || !bauth.pass) return unauthorized(res);						//invalid creds 	- block
							else if(bauth.name === net_doc.auth.username && bauth.pass === net_doc.auth.password) {	
								return next();																		//creds good 		- let them through
							}
							else return unauthorized(res);															//bad creds 		- block
						}
					}
				}
			});
		}
	};

	return exports;
};