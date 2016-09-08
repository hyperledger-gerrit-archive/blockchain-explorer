// =================================================================================
// rest_peer.js - Rest Calls to a PEER
// =================================================================================
/*global $, parse_4_peer_shortname, parse_host_for_id*/
/*exported peer_rest_get_peers, peer_rest_get_registrar, peer_rest_post_registrar, peer_rest_get_blockheight*/
/*exported peer_rest_blockstats, peer_rest_deploy, peer_rest_invoke, peer_rest_query*/

//rest call to get list of peers [PEER API]
function peer_rest_get_peers(host, port, tls, i, cb){
	console.log('peer_rest_get_peers()');
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	console.log('here', host, port, tls);

	if(!host || !port || isNaN(port)){
		if(cb) cb({error: 'no host or port'}, {shortname: i});
	}
	else{
		//console.log(proto + '://' + host.trim() + ':' + Number(port) + '/network/peers');
		$.ajax({
			method: 'GET',
			url: proto + '://' + host.trim() + ':' + Number(port) + '/network/peers',
			//data: JSON.stringify(data),
			contentType: 'application/json',
			success: function(json){
				json.peers.sort(function(a, b) {										//alpha sort me
					var textA = a.ID.name.toUpperCase();
					var textB = b.ID.name.toUpperCase();
					return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
				});
				console.log('Success - peer_rest_get_peers()', i, json);
				json.shortname = i;
				if(cb) cb(null, json);
			},
			error: function(e){
				console.log('Error - peer_rest_get_peers()', i, e);
				if(cb) cb(e, {shortname: i});
			}
		});
	}
}

//rest call to check enrollID [PEER API]
function peer_rest_get_registrar(host, port, tls, id, cb){
	console.log('peer_rest_get_registrar()');
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	
	if(!host || !port || isNaN(port)){
		if(cb) cb({error: 'no host or port'}, {id: id});
	}
	else{
		$.ajax({
			method: 'GET',
			url: proto + '://' + host.trim() + ':' + Number(port) + '/registrar/' + id,
			//data: JSON.stringify(data),
			contentType: 'application/json',
			success: function(json){
				json.id = id;
				if(cb){
					if(json.Error){
						console.log('Error - peer_rest_get_registrar()', id, json.Error);
						cb(json.Error, json);
					}
					else {
						console.log('Success - peer_rest_get_registrar()', id, json);
						cb(null, json);
					}
				}
			},
			error: function(e){
				console.log('Error - peer_rest_get_registrar()', id, e);
				if(cb) cb(e, {id: id});
			}
		});
	}
}

//rest call to registrar [PEER API]
function peer_rest_post_registrar(host, port, tls, id, secret, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/registrar';
	console.log('peer_rest_post_registrar()', url);

	if(!host || !port || isNaN(port)){
		if(cb) cb('no host or port', null);
	}
	else{
		$.ajax({
			method: 'POST',
			url: url,
			data: JSON.stringify({
									enrollId: id,
									enrollSecret: secret
								}),
			contentType: 'application/json',
			success: function(json){
				console.log('Success - peer_rest_post_registrar()', json);
				if(cb) cb(null, json);
			},
			error: function(e){
				console.log('Error - peer_rest_post_registrar()', e);
				if(cb) cb(e, null);
			}
		});
	}
}

//rest call to get blockheight [PEER API]
function peer_rest_get_blockheight(host, port, tls, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chain';
	console.log('peer_rest_get_blockheight()', parse_4_peer_shortname(peer_id));

	if(!host || !port || isNaN(port)){
		if(cb) cb('no host or port', null);
	}
	else{
		$.ajax({
			method: 'GET',
			url: url,
			success: function(json){
				json.id = peer_id;
				console.log('Success - getting peer\'s chain data', json);
				if(cb) cb(null, json);
			},
			error: function(e){
				console.log('Error - failed to get chain data');
				if(cb) cb(e, {id: parse_host_for_id(host)});				//we need id field to build status
			}
		});
	}
}

//rest call to peer to get stats for a block [PEER API]
function peer_rest_blockstats(host, port, tls, height, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chain/blocks/' + height;
	console.log('peer_rest_blockstats()', parse_4_peer_shortname(peer_id));

	$.ajax({
		method: 'GET',
		url: url,
		contentType: 'application/json',
		success: function(json){
			json.id = peer_id;
			if(cb) cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to get blockstats @ height:', height, e);
			if(cb) cb(e, null);
		}
	});
}

//rest call to peer to deploy chaincode [PEER API]
function peer_rest_deploy(host, port, tls, data, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chaincode';
	//console.log('peer_rest_deploy()', parse_4_peer_shortname(peer_id));

	$.ajax({
		method: 'POST',
		url: url,
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(json){
			console.log('Success - deployment', json);
			if(cb) cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to deploy', e);
			if(cb) cb(e, null);
		}
	});
}

//rest call to peer to invoke chaincode [PEER API]
function peer_rest_invoke(host, port, tls, data, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chaincode';
	//console.log('peer_rest_invoke()', parse_4_peer_shortname(peer_id));

	$.ajax({
		method: 'POST',
		url: url,
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(json){
			console.log('Success - deployment', json);
			if(cb) cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to deploy', e);
			if(cb) cb(e, null);
		}
	});
}

//rest call to peer to query chaincode [PEER API]
function peer_rest_query(host, port, tls, data, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chaincode';
	//console.log('peer_rest_query() for ', parse_4_peer_shortname(peer_id));

	$.ajax({
		method: 'POST',
		url: url,
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(json){
			console.log('Success - deployment', json);
			if(cb) cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to deploy', e);
			if(cb) cb(e, null);
		}
	});
}