var fs = require('fs');
var path = require('path');


//=======================================================================================================
// Create/Update Functions
//=======================================================================================================
//update a network doc
module.exports.update_network_doc = function(unused, net_doc, cb){
	fs.writeFile(path.join(__dirname, '../json_docs/yeti_network_doc.json'), JSON.stringify(net_doc, null, 4), function(e){
		if(e != null){
			if(cb) cb(500, e);
		}
		else {
			if(cb) cb(null, net_doc);
		}
	});
};


//=======================================================================================================
// Read One Functions
//=======================================================================================================
//get a network doc
module.exports.get_network_by_id = function(unused, net_id, cb){
	fs.readFile(path.join(__dirname, '../json_docs/yeti_network_doc.json'), function read(err, net_doc) {
		try{
			net_doc = JSON.parse(net_doc);
		}
		catch(e) {
			err = e;
		}
		if(cb){
			if(!err) cb(null, net_doc);
			else cb(err, net_doc);
		}
	});
};

//get a network doc by instance id
module.exports.get_network_by_instance_id = function(unused, int_id, cb){
	fs.readFile(path.join(__dirname, '../json_docs/yeti_network_doc.json'), function read(err, net_doc) {
		try{
			net_doc = JSON.parse(net_doc);
		}
		catch(e) {
			err = e;
		}
		if(cb){
			if(!err) cb(null, net_doc);
			else cb(err, net_doc);
		}
	});
};

//get cc demo doc
module.exports.get_cc_demo_doc = function(unused, cb) {
	fs.readFile(path.join(__dirname, '../json_docs/cc_demo_hashes.json'), function read(err, known_cc_hashes) {
		try{
			known_cc_hashes = JSON.parse(known_cc_hashes);
		}
		catch(e) {
			err = e;
		}
		if(cb){
			if(!err) cb(null, known_cc_hashes);
			else cb(err, known_cc_hashes);
		}
	});
};

//get a network doc
module.exports.get_env_config = function(unused, cb) {
	if(cb) cb(null, {});
};

//get stats on open/free networks
module.exports.get_network_stats = function(unused, unused2, cb) {
	if(cb) cb(null, {});
};


//=======================================================================================================
// Read Many Functions
//=======================================================================================================
//get configuration file the network setup
module.exports.get_blockchain_configs = function(unused, cb){
	if(cb) cb(null, []);			//empty on purpose
};


//=======================================================================================================
// Delete Functions
//=======================================================================================================
