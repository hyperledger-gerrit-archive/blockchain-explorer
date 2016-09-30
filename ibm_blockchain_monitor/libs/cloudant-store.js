//-----------------------------------------------------------------------------------
// Cloudant/CouchDB Session Store
//
// Copyright (c) 2016 IBM Corp.
// All rights reserved. 
//-----------------------------------------------------------------------------------
/*
Created by IBM 09/19/2016 - dshuffma
Last Updated 9/26/2016 - dshuffma

This was based on "connect-couchdb". His license is below:
https://github.com/tdebarochez/connect-couchdb



Copyright 2011 Thomas Debarochez. All rights reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.

Requires:
nano - tested with v6.1.3
express-session - tested with v1.13.0

Usage:
var CouchdbStore = require('./libs/couchdb-store.js')(session, logger);
var store = new CouchdbStore({
								name: 'uniqueNameHere',
								DB_CONNECTION_STRING: 'https://basic:auth@cloudant.com',
								DB_SESSIONS: 'sessions',
								expire_ms: 10 * 60 * 60 * 1000
							});
sessionMiddleware = session({
	secret: 'asdf',
	store: store,
	saveUninitialized: false,
	resave: true,
});
*/

module.exports = function(session, logger){
	var Store = session.Store;

	function ConnectCouchDB(opts) {
		opts = opts ||{};
		Store.call(this, opts);

		//throw input error
		if(!opts.DB_SESSIONS && !opts.DB_CONNECTION_STRING){
			throw '[Session Store] Options Error - You must define "DB_SESSIONS" and "DB_CONNECTION_STRING"';
		}
		if(!opts.name){
			throw '[Session Store] Options Error - You must define "name"';
		}

		var nano = require('nano')(opts.DB_CONNECTION_STRING);
		this.db = nano.use(opts.DB_SESSIONS);
		this.destroy_expired_ms = opts.destroy_expired_ms || (10 * 60 * 60 * 1000);	//default 10 hours
		this.throttle_ms = opts.throttle_ms || 10 * 60 * 1000;						//throttle how often we save sessions to db, default 10 minutes
		this.expire_ms = opts.expire_ms || (24 * 60 * 60 * 1000);					//how long a session should last, default 24 hours
		this.view_name = build_name(opts.name);

		//clean up session doc interval
		if(this.destroy_expired_ms > 0) this.destroyExpiredInterval = setInterval(this.destroyExpiredSessions.bind(this), this.destroy_expired_ms );

		//check the session setup and expire old session docs
		var that = this;
		this.checkSetup(opts, function(err, resp){
			that.destroyExpiredSessions();
		});
	}

	//uri safe the id
	function uri_encode(id){
		var prefix = 'session_';
		if(id.indexOf(prefix) === 0) return encodeURIComponent(decodeURIComponent(id));
		else return encodeURIComponent(decodeURIComponent(prefix + id));
	}

	//construct doc type field
	function build_name(name){
		return 'session_' + name;
	}

	ConnectCouchDB.prototype.__proto__ = Store.prototype;


	//---------------------------------------------------
	// Setup / Check Functions
	//---------------------------------------------------
	//setup design doc, used to delete expired docs
	ConnectCouchDB.prototype.setupDesignDoc = function(opts, cb){
		var designDoc = {
							_id: '_design/' + build_name(opts.name),
							views: {
								expires: {
									map: 'function(doc){' +
											'if(doc.type && doc.type === "' + build_name(opts.name) + '" && doc.sess && doc.sess.cookie){' +
												'emit(doc.sess.cookie.expires, doc._id);' +
											'}' +
										'}'
								}
							}
						};
		
		this.db.insert(designDoc, function(err, resp){
			if(err != null){
				if(err.statusCode !== 409) throw err;  				//don't care if there is a conflict error, means we already have it
				else logger.info('[Session Store] session design doc in place');
				if(cb) cb(err);
			}
			else{
				logger.info('[Session Store] session design doc created');
				setTimeout(function(){if(cb) cb(err);}, 10000);		//delay callback to allow session doc to build view
			}
		});
	};

	//check if db sessions exists
	ConnectCouchDB.prototype.checkDatabase = function(cb){
		this.db.get('', {}, function(err, resp){
			if(err && err.statusCode === 404) throw '[Session Store] session database not found';
			else logger.info('[Session Store] session database found');
			if(cb) cb(err);
		});
	};

	//check initial setup
	ConnectCouchDB.prototype.checkSetup = function(opts, cb){
		var that = this;
		this.checkDatabase(function(err){
			if(err != null) {
				if(cb) cb(err);
			}
			else{
				that.setupDesignDoc(opts, function(err){
					if(cb) cb(err);
				});
			}
		});
	};


	//---------------------------------------------------
	// Session Functions
	//---------------------------------------------------
	//get a session doc from db
	ConnectCouchDB.prototype.get = function(sid, cb){
		logger.info('----- Getting Session Doc -----', Date.now(), sid.substring(0, 6) + '...');
		sid = uri_encode(sid);
		var now = Date.now();
		this.db.get(sid, {}, function(err, doc){
			if(cb){
				if(!err && doc) {
					if(doc.sess.cookie && doc.sess.cookie.expires && now >= doc.sess.cookie.expires) {	//expired session
						logger.warn('[Session Store] session doc found but its expired');
						cb(null, null);
					}
					else cb(null, doc.sess);															//all good
				}
				else if(err && err.statusCode) {
					if(err.statusCode === 404) err.code = 'ENOENT';										//no session
					logger.warn('[Session Store] session doc not found, ' + err.statusCode);
					cb(err);
				}
				else {																					//error getting session
					logger.warn('[Session Store] session doc not found, unknown error', err);
					cb({code: 'ENOENT'});
				}
			}
		});
	};

	//edit or create a session doc 
	ConnectCouchDB.prototype.set = function(sid, sess, cb){
		logger.info('----- Setting Session Doc -----', Date.now(), sid.substring(0, 6) + '...');
		sid = uri_encode(sid);
		cb = cb || function(){};
		var that = this;
		this.db.get(sid, {}, function(err, doc){
			var now = Date.now();
			var expires = now + that.expire_ms;
			
			// ---- Create New Session Doc ----- //
			if(err){
				logger.debug('[Session Store] no session doc making a new one');
				sess.cookie.expires = expires;
				sess.cookie.originalMaxAge = that.expire_ms;
				sess.last_access = Date.now();
				doc =	{
							_id: sid,
							type: that.view_name,
							sess: sess
						};
				if(doc && doc.sess && doc.sess.save) delete doc.sess.save;	//clear this junk, not sure where its coming from
				that.db.insert(doc, function(err, resp){
					if(err != null) logger.warn('[Session Store] could not create session doc', JSON.stringify(err));
					return cb();											//don't pass any errors, not worth it
				});
			}

			// ---- Update Existing Session Doc ----- //
			else{
				var accessGap = now - doc.sess.last_access;
				var temp_originalMaxAge = sess.cookie.originalMaxAge;

				// -- Clear fields that screw up comparison -- // - don't worry about expires, we already checked it in .get()'
				sess.cookie.originalMaxAge = null;
				doc.sess.cookie.originalMaxAge = null;
				sess.cookie.expires = null;
				doc.sess.cookie.expires = null;
				if(doc && doc.sess && doc.sess.save) delete doc.sess.save;	//clear this junk, not sure where its coming from

				//if the only thing that has changed is last_access then skip saving the doc
				if(JSON.stringify(doc.sess) !== JSON.stringify(sess) || accessGap > that.throttle_ms){
					if(JSON.stringify(doc.sess) !== JSON.stringify(sess)){
						logger.debug('[Session Store] updating session doc, there is something different, ' + friendly_ms(accessGap));
					}
					else logger.debug('[Session Store] updating session doc, too much time elasped, ' + friendly_ms(accessGap));

					sess.cookie.originalMaxAge = temp_originalMaxAge;
					sess.cookie.expires = expires;
					sess.last_access = Date.now();

					doc.sess = sess;											//copy obj over
					if(doc && doc.sess && doc.sess.save) delete doc.sess.save;	//clear this junk, not sure where its coming from
					that.db.insert(doc,function(err, resp){
						if(err != null) {										//warn if error is not update conflict, update conflict is fine
							if(err.statusCode !== 409) logger.warn('[Session Store] could not update session doc', JSON.stringify(err));
						}
						return cb();											//don't pass any errors, not worth it
					});
				}
				else{
					logger.debug('[Session Store] skipping session doc update, too soon ' + friendly_ms(accessGap));
					return cb();
				}
			}
		});
	};


	//---------------------------------------------------
	// Clean up session doc functions
	//---------------------------------------------------
	//delete a session doc
	ConnectCouchDB.prototype.destroy = function(sid, cb){
		sid = uri_encode(sid);
		this.db.get(sid, {}, function(err, doc){
			if(err && cb) return cb(err);
			this.db.destroy((doc._id)?doc._id:'err', doc._rev, cb);
		});
	};

	function bulk_delete(that, docs, cb){
		var deleted_docs = [];
		for(var i in docs){
			var doc = docs[i];
			deleted_docs.push({_id: doc.doc._id, _rev: doc.doc._rev, _deleted: true});
		}
		if(deleted_docs.length > 0){
			that.db.bulk({docs: deleted_docs}, function(err, resp){								//bulk delete
				if(err != null) logger.warn('[Session Store] could not delete ' + docs.length + ' expired session docs', err);
				else logger.debug('[Session Store] deleted ' + docs.length + ' expired session docs');
				if(cb) cb();
			});
		}
		else if(cb) cb();
	}

	//remove all session docs
	ConnectCouchDB.prototype.clear = function(cb){
		var options = {include_docs: true};
		var that = this;
		this.db.view(this.view_name, 'expires', options, function(err, docs){
			if(err && cb) return cb(err);
			bulk_delete(that, docs.rows, cb);
		});
	};

	//remove expired session docs
	ConnectCouchDB.prototype.destroyExpiredSessions = function(cb){
		var now = Date.now();
		var that = this;
		var options = {endkey: now, include_docs: true};
		this.db.view(this.view_name, 'expires', options, function(err, docs){
			if(err && cb) return cb(err);
			bulk_delete(that, docs.rows, cb);
		});
	};

	//stop clean up interval
	ConnectCouchDB.prototype.clearInterval = function(){
		if(this.destroyExpiredInterval) clearInterval(this.destroyExpiredInterval);
	};

	//format ms timestamp to like 6.4 mins, or 2.0 secs
	function friendly_ms(ms){
		var ret = '';
		if(isNaN(ms)) ret = '? sec';
		else if(ms <= 0) ret = '0 secs';
		else if(ms > 60 * 60 * 1000) ret = (ms / 1000 / 60 / 60).toFixed(1) + ' hrs';	//format for hours
		else if(ms > 60 * 1000) ret = (ms / 1000 / 60).toFixed(1) + ' mins';			//format for mins
		else if(ms > 1000) ret = (ms / 1000).toFixed(1)  + ' secs';						//format for secs
		else  ret = ms  + ' ms';														//format to ms
		return ret;
	}

	return ConnectCouchDB;
};