var rest = require('../libs/rest.js');
var node_url = require('url');

module.exports = function(logger, dbConnectionString, ev, blockchain_configs) {
	var exports = {};
	var nano = require('nano')(dbConnectionString);
	var dbNetworks = nano.use(ev.DB_PREFIX + 'networks');
	var misc = require('../libs/misc.js')(logger);
	var crud = {};
	if(process.env.RUN_MODE === 'IBM-BCS') crud = require('../libs/crud_core_cl.js');
	else crud = require('../libs/crud_core_fs.js');

	//---------------------------------------------------------------------------------------------
	// get skipper's url from a [network id]
	//---------------------------------------------------------------------------------------------
	exports.get_url_from_network_id = function(network_id, cb){

		// --- Get network doc --- //
		crud.get_network_by_id(dbNetworks, network_id, function(err, resp) {
			if(err) {
				logger.error('error getting service details', err);
				return cb(err, resp);
			}
			else{
				exports.get_url_from_network_doc(resp, cb);
			}
		});
	};

	//---------------------------------------------------------------------------------------------
	// get skipper's url from a [network doc]
	//---------------------------------------------------------------------------------------------
	exports.get_url_from_network_doc = function(network_doc, cb){
		if(network_doc.pod && network_doc.pod.url){
			return cb(null, network_doc.pod.url);			//found in network doc
		}
		else{

			// --- Detect which blockchain config --- // - fallback plan if not found above
			var myConfig = misc.find_blockchain_config(network_doc, blockchain_configs);
			if(!myConfig){
				var error_msg = 'could not find blockchain config for network';
				logger.error(error_msg, network_doc.swarm);
				return cb({error: error_msg}, null);
			}
			else{
				return cb(null, myConfig.pod.url);			//found in config doc
			}
		}
	};

	//---------------------------------------------------------------------------------------------
	// get skipper's url from a [swarm name]
	//---------------------------------------------------------------------------------------------
	exports.get_url_from_swarm_name = function(swarm_name, cb){
		for(var i in blockchain_configs){
			if(blockchain_configs[i].config){
				if(swarm_name === blockchain_configs[i].config.name){
					return cb(null, blockchain_configs[i].url);	//found in config doc
				}
			}
		}
		var error_msg = 'could not find blockchain config for network';
		logger.error(error_msg);
		return cb({error: error_msg}, null);
	};

	//---------------------------------------------------------------------------------------------
	// get skipper's url from a [peer id]
	//---------------------------------------------------------------------------------------------
	exports.get_url_from_peer_id = function(peer_id, cb){
		var pos = peer_id.indexOf('_');
		var network_id = peer_id.substring(0, pos);
		exports.get_url_from_network_id(network_id, cb);
	};

	//---------------------------------------------------------------------------------------------
	// get skipper's url from an [instance id]
	//---------------------------------------------------------------------------------------------
	exports.get_url_from_instance_id = function(instance_id, cb){

		// --- Get network doc --- //
		crud.get_network_by_instance_id(dbNetworks, instance_id, function(err, resp) {
			if(err) {
				logger.error('error getting service details', err);
				return cb(err, resp);
			}
			else{
				exports.get_url_from_network_doc(resp, cb);
			}
		});
	};

	//---------------------------------------------------------------------------------------------
	// send request to skipper's api'
	//---------------------------------------------------------------------------------------------
	exports.send_req = function(req, res, url) {
		var parsed = node_url.parse(url);
		var tls = false;
		if(parsed.protocol === 'https') tls = true;
		var options = {
			host: parsed.hostname,
			port: parsed.port,
			path: req.path,
			ssl: tls,
			quiet: false,
			headers: req.headers
		};
		options.headers['content-type'] = 'application/json';
		options.headers['accept'] = 'application/json';
		options.headers.authorization = 'Basic '  + misc.b64(process.env.APP_NAME + ':' + process.env.APP_PASS);

		// --- Handle response from skipper --- //
		options.cb = function(errCode, skipper_resp){
			var statusCode = 200;
			if(errCode != null){
				logger.debug('Error sending req to skipper', errCode, skipper_resp);
				statusCode = errCode;
			}
			else {
				logger.debug('Success from skipper');
			}
			res.status(statusCode).json(skipper_resp);							//respond to orig query here
		};
		if(req.method === 'GET') rest.get(options, '');
		else if(req.method === 'POST') rest.post(options, '');
		else if(req.method === 'PUT') rest.put(options, '');
		else if(req.method === 'DELETE') rest.delete(options, '');
		else if(req.method === 'HEAD') rest.head(options, '');
	};

	return exports;
};