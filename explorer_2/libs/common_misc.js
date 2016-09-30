//------------------------------------------------------------
// common_misc.js - shared/common miscellaneous functions
//
// Copyright (c) 2016 IBM Corp.
// All rights reserved. 
//------------------------------------------------------------

module.exports = function(logger) {
	var exports = {};
	
	//------------------------------------------------------------
	// generate random string of length size
	//------------------------------------------------------------
	exports.generateRandomString = function(size) {
		var randomString = '';
		if(!size) {
			randomString += require('crypto').randomBytes(32).toString('hex');
		} else {
			var sizeDiff = size - randomString.length;
			if(sizeDiff > 0) {
				randomString += require('crypto').randomBytes(Math.floor(sizeDiff/2)).toString('hex');
			}
			sizeDiff = size - randomString.length;
			if(sizeDiff < 0) {
				randomString.slice(size);
			}
		}
		return randomString;
	};
	
	//------------------------------------------------------------
	// create or update json doc for database
	//------------------------------------------------------------
	exports.store_json_doc = function(db, filename, overwrite){
		var jsonDoc = require('../json_docs/' + filename);					//looking in project root /json_docs/FILENAME.json
		if(jsonDoc._rev) delete jsonDoc._rev;
		
		if(!jsonDoc._id){													//lets check we loaded something that looks at least 10% correct
			logger.error('store_json_doc() Where is the ' + filename + ' doc!!!');
		}
		else{
			logger.info('store_json_doc() Found ' + filename + ' doc id: ' + jsonDoc._id);
			db.get(jsonDoc._id, function(err, existingDoc) {
				if(err) {
					db.insert(jsonDoc, jsonDoc._id, function(err) {
						if(err) {
							logger.error('store_json_doc() Error: Cannot create json document -', jsonDoc._id, err);
						}
						else{
							logger.info('store_json_doc() Created json doc ' + jsonDoc._id);				//create
						}
					});
				}
				else if(overwrite){														//only overwrite a doc if input arg is true
					jsonDoc._rev = existingDoc._rev;
					db.insert(jsonDoc, jsonDoc._id, function(err) {
						if(err) {
							logger.error('store_json_doc() Error: Cannot update json document - ' + jsonDoc._id, err);
						}
						else{
							logger.info('store_json_doc() Updated json doc ' + jsonDoc._id);				//update
						}
					});
				}
				else{
					logger.info('store_json_doc() The doc ' + jsonDoc._id + ' already exist, leaving it alone');//do nothing
				}
			});
		}
	};
	
	//------------------------------------------------------------
	// format ms timestamp to like 6.4 mins, or 2.0 secs
	//------------------------------------------------------------
	exports.friendly_ms = function(ms){
		var ret = '';
		if(isNaN(ms)) ret = '? sec';
		else if(ms <= 0) ret = '0 secs';
		else if(ms > 60 * 60 * 1000) ret = (ms / 1000 / 60 / 60).toFixed(1) + ' hrs';	//format for hours
		else if(ms > 60 * 1000) ret = (ms / 1000 / 60).toFixed(1) + ' mins';			//format for mins
		else if(ms > 1000) ret = (ms / 1000).toFixed(1)  + ' secs';						//format for secs
		else  ret = ms  + ' ms';														//format to ms
		return ret;
	};
	
	//------------------------------------------------------------
	// filter enroll IDs, don't show the secret enollIds for the dashboard or our admin
	//------------------------------------------------------------
	exports.filter_enrollIDs = function(enrollIDsArray){
		var users = [];
		var filter_out = ['dashboard', 'ibm_admin'];
		for(var i in enrollIDsArray){
			var skip = false;
			for(var x in filter_out){
				if(enrollIDsArray[i].enrollId.indexOf(filter_out[x]) >= 0) skip = true;
			}
			if(skip === false) users.push(enrollIDsArray[i]);
		}
		return users;
	};

	//------------------------------------------------------------
	// build vcap services object
	//------------------------------------------------------------
	exports.build_vcap_object = function(net_doc) {

		// Make the array of Peers
		var peers_list = [];
		for(var peer_id in net_doc.peers) {
			delete(net_doc.peers[peer_id].companion);
			delete(net_doc.peers[peer_id].url);
			delete(net_doc.peers[peer_id].security);

			var peer = net_doc.peers[peer_id];
			peer.id = peer_id;
			peer.api_url = 'http://' + peer.api_host + ':' + peer.api_port;
			peers_list.push(peer);
		}

		// Add the CA
		var users_list = [];
		for(var ca_key in net_doc.ca) {
			for(var user in net_doc.ca[ca_key].users) {
				if(user.indexOf('peer') == -1) {
					// In future, get rid of username & secret and keep enrollId & enrollSecret only
					users_list.push({ username: user, secret: net_doc.ca[ca_key].users[user], enrollId: user, enrollSecret: net_doc.ca[ca_key].users[user]});
				}
			}
			delete(net_doc.ca[ca_key].users);
		}

		var certDownloadLink = '';
		if(net_doc.pod) certDownloadLink = net_doc.pod.certDownloadLink;
		else certDownloadLink = net_doc.certDownloadLink;						//for yeti mode

		return 	{
					credentials: {
						peers: peers_list,
						ca: net_doc.ca,
						users: users_list,
						cert: certDownloadLink
					}
				};
	};

	//------------------------------------------------------------
	// base64 encode a string
	//------------------------------------------------------------
	exports.b64 = function(str){
		return new Buffer(str).toString('base64');
	};

	return exports;
};