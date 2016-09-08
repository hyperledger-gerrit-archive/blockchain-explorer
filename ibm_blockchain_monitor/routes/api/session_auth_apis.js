var express = require('express');
var fs = require('fs');
var path = require('path');

module.exports = function(dbConnectionString, blockchain_configs, logger, ev, sessionMiddleware) {
	var app = express();
	var nano = require('nano')(dbConnectionString);
	var dbNetworks = nano.use(ev.DB_PREFIX + 'networks');
	var middle = require('../../libs/mine/middleware.js')(logger, dbConnectionString, ev);
	var skipper = require('../../libs/skipper_proxy.js')(logger, dbConnectionString, ev, blockchain_configs);
	var misc	= require('../../libs/misc.js')(logger);
	var crud = {};
	if(process.env.RUN_MODE === 'IBM-BCS') crud = require('../../libs/crud_core_cl.js');
	else crud = require('../../libs/crud_core_fs.js');

	var apiSessionAuth = [];
	if(process.env.RUN_MODE === 'IBM-BCS'){
		apiSessionAuth = [sessionMiddleware, middle.enforce_users_session];
	}
	else if(process.env.RUN_MODE === 'YETI'){
		apiSessionAuth = [middle.check_basic_auth];
	}

	//get network service credentials object - similar to whats in vcap
	app.get('/api/network/:network_id', apiSessionAuth, function(req, res, next) {
		var network_id = req.params.network_id;
		// Get the network document from database
		crud.get_network_by_id(dbNetworks, network_id, function(e, net_doc){
			if(e != null){
				logger.error('could not find network document');
				res.status(404).json({errors: 'could not find network document'});
			}
			else{
				var blk_config = misc.find_blockchain_config(net_doc, blockchain_configs);
				if(!blk_config) {
					logger.error('could not find a blockchain.js for this network');
					res.status(500).json({errors: 'could not find a blockchain.js for this network'});
				}
				else{
					var vcap = misc.build_vcap_object(net_doc, blk_config);
					vcap.credentials.users =  misc.filter_enrollIDs(vcap.credentials.users);
					res.status(200).json(vcap);
				}
			}
		});
	});
	
	//get ALL network details - full doc
	app.get('/api/network/:network_id/full', apiSessionAuth, function(req, res, next) {
		var network_id = req.params.network_id;

		// Get the network document from database
		crud.get_network_by_id(dbNetworks, network_id, function(err, doc) {
			if(err) {
				logger.error('error getting service details', err);
				return res.status(err).json(doc);
			}
			else{
				res.status(200).json(doc);
			}
		});
	});
	
	//get network peers, an enrollID and swarm info [this response is like the vcap obj, but special]
	app.get('/api/network/:network_id/peers', apiSessionAuth, function(req, res) {
		var network_id = req.params.network_id;
		
		// Get the network document from database
		crud.get_network_by_id(dbNetworks, network_id, function(e, net_doc){
			if(e != null){
				logger.error('could not find network document');
				res.status(404).json({errors: 'could not find network document'});
			}
			else{
				var toRet = {															//object to return
								peers: [],
								reset: net_doc.reset,
								swarm: net_doc.swarm,
								user: null
							};

				// ---- build ca entry array ---- //
				var temp = null;
				for(var ca_id in net_doc.ca){											//build entry for CA
					temp = 	{
								id: ca_id,
								type: 'ca',
								discovery_host: net_doc.ca[ca_id].discovery_host,
								discovery_port: net_doc.ca[ca_id].discovery_port,
								api_host: net_doc.ca[ca_id].api_host,
								api_port: net_doc.ca[ca_id].api_port,
								tls: false
							};
					if(net_doc.ca[ca_id].api_port && !isNaN(net_doc.ca[ca_id].api_port_tls)){
						temp.api_port = net_doc.ca[ca_id].api_port_tls;
						temp.tls = true;
					} 
					toRet.peers.push(temp);
				}

				// ---- build peer's entries ---- //
				temp = null;
				for(var peer_id in net_doc.peers){										//build entry for PEERS
					temp = 	{
								id: peer_id,
								type: 'peer',
								discovery_host: net_doc.peers[peer_id].discovery_host,
								discovery_port: net_doc.peers[peer_id].discovery_port,
								api_host: net_doc.peers[peer_id].api_host,
								api_port: net_doc.peers[peer_id].api_port,
								tls: false
							};
					if(net_doc.peers[peer_id].api_port_tls && !isNaN(net_doc.peers[peer_id].api_port_tls)){
						temp.api_port = net_doc.peers[peer_id].api_port_tls;
						temp.tls = true;
					} 
					toRet.peers.push(temp);
				}

				toRet.peers.sort(function(a, b) {										//alpha sort me
					var textA = a.id.toUpperCase();
					var textB = b.id.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});


				// ---- find dashboard enroll id ---- //
				var blk_config = misc.find_blockchain_config(net_doc, blockchain_configs);
				if(!blk_config) {
					logger.error('could not find a blockchain.js for this network');
					res.status(500).json({errors: 'could not find a blockchain.js for this network'});
				}
				else{
					var vcap = misc.build_vcap_object(net_doc, blk_config);
					var cred = vcap.credentials;
					for(var i in cred.users){
						if(cred.users[i].enrollId.indexOf('dashboarduser') === 0){		//prefer to give out dedicated enrollIDs
							toRet.user = cred.users[i];
							break;
						}
					}
					
					if(!toRet.user || !toRet.user.enrollId){							//if we didn't find any enrollIDs yet grab a type0
						for(i in cred.users){
							if(cred.users[i].enrollId.indexOf('user_type0') === 0){
								toRet.user = cred.users[i];
								break;
							}
						}
					}
					
					if(!toRet.user || !toRet.user.enrollId){							//if we didn't find any enrollIDs yet grab a type1...
						for(i in cred.users){
							if(cred.users[i].enrollId.indexOf('user_type1') === 0){
								toRet.user = cred.users[i];
								break;
							}
						}
					}

					if(!toRet.user || !toRet.user.enrollId){							//if its a yeti network grab it from the peer obj instead
						for(i in cred.peers){
							if(cred.peers[i].users && cred.peers[i].users[0]){
								toRet.user = {enrollId: cred.peers[i].users[0]};		//there is no secret, make do
								break;
							}
						}
					}
				}

				res.status(200).json(toRet);											//all done here
			}
		});
	});

	//get network's ca status
	app.get('/api/network/:network_id/ca/status', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
				skipper.get_url_from_network_id(req.params.network_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});

	//get peer logs
	app.get('/api/peer/:peer_id/logs', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_peer_id(req.params.peer_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});

	//restart peer
	/* removed - 8/31, dsh
	app.get('/api/peer/:peer_id/restart', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_peer_id(req.params.peer_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});
	*/

	//start peer
	app.get('/api/peer/:peer_id/start', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_peer_id(req.params.peer_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});

	//stop peer
	app.get('/api/peer/:peer_id/stop', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_peer_id(req.params.peer_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});
	
	//get network chaincodes
	app.get('/api/network/:network_id/chaincodes', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_network_id(req.params.network_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});

	//get chaincode logs
	app.get('/api/peer/:peer_id/chaincode/:chaincode_id/logs', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_peer_id(req.params.peer_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});

	//get the network's reset status
	app.get('/api/network/:network_id/reset/status', apiSessionAuth, function(req, res, next) {
		var network_id = req.params.network_id;
		
		// Get the network document from database
		crud.get_network_by_id(dbNetworks, network_id, function(e, net_doc){
			if(e != null){
				logger.error('could not find network document');
				res.status(404).json({errors: 'could not find network document'});
			}
			else {

				// ---- Parse reset_history to create response ---- //
				var ret = 	{																	//default values
								status: 'never been reset',
								started_timestamp: 0,
								deleted_timestamp: 0,
								finished_timestamp: 0,
								percent: 0
							};
				if(net_doc.reset_history){
					if(net_doc.reset_history.finished_timestamp > 0){							//reset is done
						ret =	{
									status: 'reset complete',
									started_timestamp: net_doc.reset_history.started_timestamp,
									deleted_timestamp: net_doc.reset_history.deleted_timestamp,
									finished_timestamp: net_doc.reset_history.finished_timestamp,
									percent: 100
								};
						var elasped = Date.now() - net_doc.reset_history.finished_timestamp;	//reset is done but still wait x secs for it to startup
						if(elasped <= 80 * 1000){
							ret.status = 'reset finsihing';
							ret.percent = 80;
						}
					}
					else {																		//reset is still going on
						ret = 	{
									status: 'reset in progress',
									started_timestamp: net_doc.reset_history.started_timestamp,
									deleted_timestamp: net_doc.reset_history.deleted_timestamp,	//if == -1 there was an error deleting
									finished_timestamp: 0,
									percent: 0
								};
						if(net_doc.reset && net_doc.reset.steps){								//steps relate to percent done
							if(net_doc.reset.steps.length === 2) ret.percent = 10;
							if(net_doc.reset.steps.length === 1) ret.percent = 40;
						}
					}
				}
				res.status(200).json(ret);
			}
		});
	});

	//reset the network - delete and recreate with the same name
	app.post('/api/network/:network_id/reset/', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'YETI') next();
		else{
			skipper.get_url_from_network_id(req.params.network_id, function(errCode, resp){
				if(errCode != null) res.status(errCode).json(resp);
				else skipper.send_req(req, res, resp);
			});
		}
	});


	//--------------------------------
	// YETI APIs 
	//--------------------------------
	//receive save network api
	app.post('/api/network', apiSessionAuth, function(req, res, next) {
		if(process.env.RUN_MODE === 'IBM-BCS') next();
		else{
			var doc = {};
			try{
				doc = JSON.parse(req.body.net_doc);		//receive it here if its JSON as string
			}
			catch(e){
				doc = req.body;							//receive it here if its already json
			}
			if(!doc._id || !doc.peers){
				res.status(400).json({error: 'bad input, field "_id" or field "peers" was not found'});
			}
			else{
				fs.writeFile(path.join(__dirname, '../../json_docs/yeti_network_doc.json'), JSON.stringify(doc, null, 4), function(e){
					if(e != null){
						logger.error('[ibc-js] ibc.save() error', e);
						res.status(500).json(e);
					}
					else {
						res.redirect('/v2/network/' + doc._id);
					}
				});
			}
		}
	});

	return app;
};