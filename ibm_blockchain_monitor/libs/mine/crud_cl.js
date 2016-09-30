//=======================================================================================================
// Crud Module for Cloudant
//
// Copyright (c) 2016 IBM Corp.
// All rights reserved. 
//=======================================================================================================
module.exports = function(ev, logger){
	var crud = {};
	var common_misc = require('../common_misc.js')(logger);
	var nano = require('nano')(ev.DB_CONNECTION_STRING);

	// --- Store Design Doc --- //
	common_misc.store_json_doc(nano.use(ev.DB_PREFIX + 'networks'), 'network_design_doc.json', true);


	//=======================================================================================================
	// Create/Update Functions
	//=======================================================================================================
	//update a network doc
	crud.update_network_doc = function(db, net_doc, whom, cb) {
		var allowed_to_edit = false;

		// ---- Figure out if we can edit or not ---- //
		if(!net_doc.reset){								//if net is NOT resetting, everybody can edit!
			allowed_to_edit = true;
		}
		else{											//else only a few function can edit the network doc
			switch(whom){
				case 'createNetwork':					//you can edit
					allowed_to_edit = true;
					break;
				case 'resetNetwork':					//you can edit
					allowed_to_edit = true;
					break;
				case 'deleteNetwork':					//you can edit
					allowed_to_edit = true;
					break;
				default:								//no one else can edit
					allowed_to_edit = false;
			}
		}

		if(allowed_to_edit !== true){					//this protects code against update conflicts during a reset
			var error_msg = '[Warning] - Cannot edit net document b/c network is resetting';
			cb(409, {error: error_msg});
		}
		else{											//all good, go edit
			db.insert(net_doc, function(err, body) {
				if (cb) {
					if (!err && body) {
						net_doc._rev = body.rev;
						cb(null, net_doc);
					}
					else if (err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
					else cb(500, {error: err, reason: 'unknown!'});
				}
			});
		}
	};


	//=======================================================================================================
	// Read One Functions
	//=======================================================================================================
	//get a network doc
	crud.get_network_by_id = function(db, net_id, cb) {
		db.get(net_id, {}, function(err, body) { //doc_name, query parameters, callback
			if (cb) {
				if (!err && body) cb(null, body);
				else if (err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
				else cb(500, {error: err, reason: 'unknown!'});
			}
		});
	};

	//get a network doc by instance id
	crud.get_network_by_instance_id = function(db, int_id, cb) {
		db.view(process.env.APP_NAME, '_networks_by_instance', {
			key: int_id,
			include_docs: 'true'
		}, function(err, body) { //design_doc, view_name, query parameters, callback
			if (cb) {
				if (!err) {
					if (body && body.rows && body.rows.length > 0) cb(null, body.rows[0].doc);
					else cb(404, {error: body,reason: 'not found'});
				}
				else if (err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
				else cb(500, {error: err, reason: 'unknown!'});
			}
		});
	};

	//get cc demo doc
	crud.get_cc_demo_doc = function(db, cb) {
		db.get('cc_demos', {}, function(err, body) { //doc_name, query parameters, callback
			if (cb) {
				if (!err && body) cb(null, body);
				else if (err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
				else cb(500, {error: err, reason: 'unknown!'});
			}
		});
	};

	//get a network doc
	crud.get_env_config = function(db, cb) {
		db.get('settings', {}, function(err, body) { //doc_name, query parameters, callback
			if (cb) {
				if (!err && body) cb(null, body);
				else if (err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
				else cb(500, {error: err, reason: 'unknown!'});
			}
		});
	};

	//get stats on open/free networks
	crud.get_network_stats = function(db, swarm_name, cb) {
		var options = {
			group: 'true'
		};
		if (swarm_name) options = {
			group: 'true',
			start_key: [swarm_name],
			end_key: [swarm_name, {}]
		};
		db.view(process.env.APP_NAME, '_networks_by_status', options, function(err, body) { //design_doc, view_name, query parameters, callback
			if (cb) {
				if (!err) {
					var SWARM_NAME = 0, USAGE = 1, VALIDITY = 2;
					var temp = {};
					
					for(var i in body.rows) {
						var swarm_name = body.rows[i].key[0];
						temp[swarm_name] = 	{ 									//make defaults, the build safe below will not set 0s
											'in_pool': {
												'valid': 0,
												'deleted': 0,
												'limit_exceeded': 0,
												'failed_health_check': 0
											},
											'in_use': {
												'valid': 0,
												'deleted': 0,
												'limit_exceeded': 0
											}
										};
					}
					for(i in body.rows) { 										//parse it into more useful obj
						var key1 = body.rows[i].key[SWARM_NAME];				//swarm name
						var key2 = body.rows[i].key[USAGE];						//in_pool vs in_use
						var key3 = body.rows[i].key[VALIDITY];					//valid OR deleted OR limit_exceeded
						if (!temp[key1]) temp[key1] = {}; 						//build it safely
						if (!temp[key1][key2]) temp[key1][key2] = {};			//build it safely
						temp[key1][key2][key3] = body.rows[i].value;			//set it
					}
					cb(null, temp);
				}
				else if (err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
				else cb(500, {error: err, reason: 'unknown!'});
			}
		});
	};


	//=======================================================================================================
	// Read Many Functions
	//=======================================================================================================


	//=======================================================================================================
	// Delete Functions
	//=======================================================================================================

	return crud;
};
