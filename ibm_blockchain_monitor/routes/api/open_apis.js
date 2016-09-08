var express = require('express');

module.exports = function(dbConnectionString, logger, ev, sessionMiddleware) {
	var nano = require('nano')(dbConnectionString);
	//var dbNetworks = nano.use(ev.DB_PREFIX + 'networks');
	var dbConfig = nano.use(ev.DB_PREFIX + 'config');
	var crud = {};
	if(process.env.RUN_MODE === 'IBM-BCS') crud = require('../../libs/crud_core_cl.js');
	else crud = require('../../libs/crud_core_fs.js');
	var app = express();
	
	//get known chaincode demos
	app.get('/api/chaincode/demos', function(req, res) {
		crud.get_cc_demo_doc(dbConfig, function(err, doc){
			if(err != null){
				res.status(500).json({error: 'cannot find demo cc doc'});
			}
			else{
				if(doc._id) delete doc._id;
				if(doc._rev) delete doc._rev;
				res.status(200).json(doc);
			}
		});
	});

	return app;
};