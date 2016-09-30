//------------------------------------------------------------
// misc.js - private miscellaneous functions
//
// Copyright (c) 2016 IBM Corp.
// All rights reserved. 
//------------------------------------------------------------

module.exports = function(logger) {
	var exports = {};

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
		if(env.HOSTNAME == null || env.HOSTNAME === '') {
			errors.push('env error: HOSTNAME cannot be blank. ' + env.HOSTNAME);
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