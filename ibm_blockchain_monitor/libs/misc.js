var uuid = require('node-uuid');

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
			logger.error('Where is the ' + filename + ' doc!!!');
		}
		else{
			logger.info('Found ' + filename + ' doc id: ' + jsonDoc._id);
			db.get(jsonDoc._id, function(err, existingDoc) {
				if(err) {
					db.insert(jsonDoc, jsonDoc._id, function(err) {
						if(err) {
							logger.error('Error: Cannot create json document -', jsonDoc._id, err);
						}
						else{
							logger.info('Created json doc ' + jsonDoc._id);				//create
						}
					});
				}
				else if(overwrite){														//only overwrite a doc if input arg is true
					jsonDoc._rev = existingDoc._rev;
					db.insert(jsonDoc, jsonDoc._id, function(err) {
						if(err) {
							logger.error('Error: Cannot update json document - ' + jsonDoc._id, err);
						}
						else{
							logger.info('Updated json doc ' + jsonDoc._id);				//update
						}
					});
				}
				else{
					logger.info('The doc ' + jsonDoc._id + ' already exist, leaving it alone');//do nothing
				}
			});
		}
	};
	
	//------------------------------------------------------------
	// find the correct blockchain.js for this network
	//------------------------------------------------------------
	exports.find_blockchainjs = function(net_doc, blockchains){
		if(!net_doc.swarm) return false;
		if(!net_doc.swarm.name) return false;
		for(var i in blockchains){
			if(net_doc.swarm.name === blockchains[i].config.name){
				return blockchains[i];
			}
		}
		return false;
	};

	//------------------------------------------------------------
	// find the correct blockchain config for this network
	//------------------------------------------------------------
	exports.find_blockchain_config = function(net_doc, configs){
		if(process.env.RUN_MODE === 'YETI') return 'n/a-yeti_mode';
		if(!net_doc.swarm) return false;
		if(!net_doc.swarm.name) return false;
		for(var i in configs){
			if(net_doc.swarm.name === configs[i].name){
				return configs[i];
			}
		}
		return false;
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
	// return a friendly debug id for logs
	//------------------------------------------------------------
	exports.build_debug_label = function(config){
		if(!config || !config.uuid || !config.name) return '[?/?] ';
		else return '[' + config.uuid.substring(0, 3) + '/' + config.name + '] ';		//first 3 chars of the uuid of blockchain.js and the swarm name
	};

	//------------------------------------------------------------
	// build the download certificate link for this environment and blockchain config
	//------------------------------------------------------------
	exports.build_cert_download_link = function(config){
		// This is the subdomain for <vp/ca>.<routeSubdomain>.blockchain.ibm.com
		var routeSubdomain = '', overlayNetworkName = '';
		if(config.zone === 'dev') {
			routeSubdomain = '.dev';
		}
		else if(config.zone === 'staging') {
			routeSubdomain = '.stage';
		}
		// If route subdomain is mentioned in the config, it should override all of the above
		if(config.route_subdomain) {
			routeSubdomain = config.route_subdomain;
		}
		if(routeSubdomain === '') {
			overlayNetworkName = 'blockchain.ibm.com';
		}
		else {
			overlayNetworkName = routeSubdomain.split('.').join('') + '.blockchain.ibm.com';
		}
		if(config.arch === 'z') return config.certs_url + '/zone.blockchain.ibm.com.cert';	//https://blockchain-certs.mybluemix.net
		else return  config.certs_url + '/' + overlayNetworkName + '.cert';					//https://blockchain-certs.mybluemix.net
	};

	//------------------------------------------------------------
	// build up the blockchain_config from swarm document
	//------------------------------------------------------------
	exports.build_blockchain_config = function(config_doc, ev){
		var config = {};
		if(config_doc){
			config = {
								uuid: uuid.v4(),							//unique id of running swarm (used for locks)
								id: config_doc._id,							//id of the swarm document
								enabled: config_doc.enabled,				//whether or not this swarm is handing out networks
								dbConnectionString: ev.DB_CONNECTION_STRING,//our database pass + connection url
								dbPrefix: ev.DB_PREFIX,						//environment gets prefixed to database name
								peer_swarm: config_doc.peer_swarm,
								companion_swarm: config_doc.companion_swarm,
								name: config_doc._id,						//name of the swarm like us_south_x86
								arch: config_doc.arch,						//name of swarm arch like x86 or z
								region: config_doc.region,					//name of geo region for swarm like us_south
								broker_ver: ev.VERSION,						//version # like 0.4.1
								zone: ev.ZONE,								//environment like dev/staging/prod
								certs_url: config_doc.certs_url,			//TLS certificate URL
								pod: config_doc.pod							//pod object {url: }
							};
			if(config_doc.route_subdomain) config.route_subdomain =  config_doc.route_subdomain;	//?
			config.certDownloadLink = exports.build_cert_download_link(config);		//user's certificate download link'
		}
		if(process.env.RUN_MODE === 'IBM-BCS') exports.check_blk_config(config);	//check if config is okay
		return config;
	};

	//------------------------------------------------------------
	// check if the blockchain configuration has everything we need
	//------------------------------------------------------------
	exports.check_blk_config = function(cfg){
		var errors = [];
		if(cfg.uuid == null || cfg.uuid === '') {
			errors.push('config error: uuid cannot be blank. ' + cfg.uuid);
		}
		if(cfg.id == null || cfg.id === '') {
			errors.push('config error: id cannot be blank. ' + cfg.id);
		}
		if(cfg.enabled !== true && cfg.enabled !== false) {
			errors.push('config error: enabled must be boolean. ' + cfg.enabled);
		}
		if(cfg.dbConnectionString == null || cfg.dbConnectionString === '') {
			errors.push('config error: uuid cannot be blank. ' + cfg.dbConnectionString);
		}
		if(cfg.dbPrefix == null || cfg.dbPrefix === '') {
			errors.push('config error: dbPrefix cannot be blank. ' + cfg.dbPrefix);
		}
		if(cfg.peer_swarm == null) {
			errors.push('config error: peer_swarm cannot be blank. ');
		}
		if(cfg.companion_swarm == null) {
			errors.push('config error: companion_swarm cannot be blank. ');
		}
		if(cfg.name == null || cfg.name === ''){
			errors.push('config error: name cannot be blank. ' + cfg.name);
		}
		if(cfg.arch !== 'x86' && cfg.arch !== 'z'){
			errors.push('config error: arch must be z or x86. ' + cfg.arch);
		}
		if(cfg.region == null || cfg.region === ''){
			errors.push('config error: region cannot be blank. ' + cfg.region);
		}
		if(cfg.broker_ver == null || cfg.broker_ver === ''){
			errors.push('config error: broker_ver cannot be blank. ' + cfg.broker_ver);
		}
		if(cfg.zone == null || cfg.zone === ''){
			errors.push('config error: zone cannot be blank. ' + cfg.zone);
		}
		/* this is optional i think - dsh 8/18/2016
		if(cfg.route_subdomain == null || cfg.route_subdomain === ''){
			 errors.push('config error: route_subdomain cannot be blank. ' + cfg.route_subdomain);
		}
		*/
		if(cfg.certs_url == null || cfg.certs_url === ''){
			errors.push('config error: certs_url cannot be blank. ' + cfg.certs_url);
		}
		if(cfg.certDownloadLink == null || cfg.certDownloadLink === ''){
			errors.push('config error: certDownloadLink cannot be blank. ' + cfg.certDownloadLink);
		}
		if(cfg.pod == null || cfg.pod.url == null || cfg.pod.url === ''){
			errors.push('config error: pod.url cannot be blank. ');
		}

		// --- Print Errors --- //
		if(errors.length > 0){
			logger.error('---------------------------------------------------------');
			logger.error('[' + cfg.name + '] Error with configuraiton!');
			for(var i in errors) logger.error(errors[i]);
			logger.error('---------------------------------------------------------\n');
			process.exit();												//shut down everything
		}
		else logger.info('[' + cfg.name + '] Blockchain Configuration looks good!');
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
	exports.build_vcap_object = function(net_doc, config) {

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
		if(config && config.certDownloadLink) certDownloadLink= config.certDownloadLink;
		else certDownloadLink = net_doc.certDownloadLink;								//for yeti mode

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


	//------------------------------------------------------------
	// check if starting env have everything we need
	//------------------------------------------------------------
	exports.check_starting_envs = function(env){
		var errors = [];
		if(env.ZONE == null || env.ZONE === '') {
			errors.push('env error: ZONE cannot be blank. ' + env.ZONE);
		}
		if(env.DB_CONNECTION_STRING == null || env.DB_CONNECTION_STRING === '') {
			errors.push('env error: DB_CONNECTION_STRING cannot be blank. ' + env.DB_CONNECTION_STRING);
		}
		if(env.DB_PREFIX == null || env.DB_PREFIX === '') {
			errors.push('env error: DB_PREFIX cannot be blank. ' + env.DB_PREFIX);
		}
		if(env.REGION == null || env.REGION === '') {
			errors.push('env error: REGION cannot be blank. ' + env.REGION);
		}

		// --- Print Errors --- //
		if(errors.length > 0){
			logger.error('---------------------------------------------------------');
			logger.error('Error with starting env variables!');
			for(var i in errors) logger.error(errors[i]);
			logger.error('---------------------------------------------------------\n');
			process.exit();												//shut down everything
		}
		else logger.info('Starting env variables look good!');
	};

	return exports;
};