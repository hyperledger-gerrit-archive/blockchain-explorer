// =================================================================================
// helper.js - JS functions needed on multiple pages
// =================================================================================
/* global $, document, network_id, window */
/* exported appendChaincodeTable, show_status, appendPeerTable, convertTimeToSeconds, convertSecondsToTime, rest_reset_network, hideGenericPopup*/
/* exported rest_get_chaincode, rest_get_peers, GOOD_STATUS, BAD_STATUS, rest_get_reset_status, rest_restart_peer */
/* exported rest_get_service_status, formatDate, escapeHtml, toTitleCase, build_status, rest_get_ca, resize_peer_names*/
/* exported check_if_refresh_interval, pause_refresh, reset_status_interval, user, peer, tab, cc_hashes, known_ccs, logger*/
/* exported bag, selected_peer, get_last, known_blocks, blockheight_interval, last, count, goingDown, TYPE_DEPLOY, TYPE_INVOKE, TYPE_QUERY, TYPE_TERMINATE*/
/* exported next, rest_start_peer, rest_post_registrar, rest_get_registrar, rest_get_cc_hashses, CANT_GET_STATUS*/

//globals for all tabs
var reset_status_interval = null;
var pause_refresh = false;						//when true the auto refresh timer will freeze, the interval continues...
var GOOD_STATUS = 'running';
var MEH_STATUS = 'restarting';
var BAD_STATUS = 'exited';
var CANT_GET_STATUS = 'unknown';

// =================================================================================
// Chaincode Stuff
// =================================================================================
//rest get chaincode details
function rest_get_chaincode(cb) {
	var url = '/api/network/' + network_id + '/chaincodes';
	console.log('getting ' + url);
	$.ajax({
		method: 'GET',
		url: url,
		headers: { 
			Accept : 'application/json'
		},
		success: function(json){
			console.log('Success - getting chaincode data:', json);
			cb(null, json);
		},
		error: function(e){
			console.log('Failed to get chaincode data');
			cb(e);
		}
	});
}

//build chaincode table
function appendChaincodeTable(id, chaincode) {
	chaincode.sort(function(a, b) {								//alpha sort me
		var textA = a.peer_id.toUpperCase();
		var textB = b.peer_id.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	console.log('adding chaincode', chaincode);
	var options = '';
	var clone_cc = $('#chaincode .sample_cc').clone();

	clone_cc.find('.upTime').html('');															//clear it out
	for(var i in chaincode){
		options += '<option value="' + chaincode[i].peer_id + '">';
		options +=		parse_4_peer_shortname(chaincode[i].peer_id);
		options += '</option>';
		clone_cc.find('.upTime').append('<span class="ccUpTime ' + chaincode[i].peer_id + '">' + chaincode[0].status + '</span>');
	}
	
	var cc_id = '';
	cc_id +=		'<span class="ccidWrap bx--tooltip__top" data-tooltip="' + id +'">';
	cc_id +=			'<span class="ccTxt" full="' + id + '">' + id + '...</span>';
	cc_id +=		'</span>';
	cc_id +=		'<button class="copyButton copyButtonStyle" data-clipboard-text="' + id +'">Copy</button>';
	clone_cc.find('.ccIdTd').html(cc_id);

	clone_cc.find('.chaincode_peer_count').html(chaincode.length);
	clone_cc.find('.ccPeerSelect').html(options).attr('cc_id', id);
	clone_cc.find('.logs').attr('peer_id', chaincode[0].peer_id).attr('cc_id', id); //set it to the first one
	clone_cc.addClass('actualCC');
	clone_cc.removeClass('sample');
	clone_cc.removeClass('sample_cc');
	$('#chaincode tbody').append(clone_cc);
	clone_cc.show();
	
	$('.ccUpTime').hide();
	$('.upTime').each(function(){
		$(this).children().first().show();
	});
}

//show status for selected chaincode
function show_status(me){
	var peer_id = $(me).val();
	var cc_id = $(me).attr('cc_id');
	//console.log('changed', peer_id, ' ---- ', cc_id);
	$('.ccUpTime').hide();
	$(me).next().attr('peer_id', peer_id).attr('cc_id', cc_id);
	$('.' + peer_id).show();
}

// =================================================================================
// Peer Stuff
// =================================================================================
//rest get peer details
function rest_get_peers(cb) {
	console.log('getting /api/network/' + network_id + '/peers');
	$.get('/api/network/' + network_id + '/peers')
		.done(function(data){

			// FAKE NETWORK - dsh - todo remove this //
			for(var i = 0; i < 4; i++){
				data.peers[i+1].api_host ='6183e812-a6fe-4bd4-b21c-adf12840b460_vp' + i + '.us.blockchain.ibm.com';
				data.peers[i+1].api_port = 443;
				data.peers[i+1].tls = true;
			}
			data.user =	{
							enrollId: 'dashboarduser_type1_cf1e29d2f4',
							enrollSecret: 'aa968ecac6'
						};
			//end
				
			console.log('Success - getting peer status data', data);
			cb(null, data);
		})
		.fail(function(e){
			console.log('Error - failed to get peer status data');
			cb(e);
		});
}

//rest get ca status
function rest_get_ca(hostname, cb) {
	//console.log('getting ca status', hostname);
	$.get('/api/network/' + network_id + '/ca/status')
		.done(function(data){
			data.id = parse_host_for_id(hostname);
			console.log('Success - getting ca status data');
			cb(null, data);
		})
		.fail(function(e){
			console.log('Error - failed to get ca status data');
			cb(e, {id: parse_host_for_id(hostname)});										//we need id field to build status
		});
}

//create friendly name for peer
function friendly_name(id){
	var pos = id.indexOf('_');
	var name = id.substring(pos + 1).toUpperCase();

	var i = id.indexOf('_vp');
	if(i >= 0){
		name = 'Validating Peer ' + id.substring(i + 3);			//strip off the '_vpx'
	}
	
	var m = id.indexOf('_ca');
	if (m >= 0){
		name = 'Membership Services';								//just rename the stupid thing
	}

	return name;
}

//append to the peer table
function appendPeerTable(peer, total_peers) {
	var clone = $('.sample_peer').clone().hide();
	var api_full_name = 'http://' + peer.api_host + ':' + peer.api_port;
	if(peer.tls === true) api_full_name = 'https://' + peer.api_host + ':' + peer.api_port;
	var disc_full_name = 'grpcs://' + peer.discovery_host + ':' + peer.discovery_port;

	var pos = peer.id.indexOf('_ca');
	var default_text = api_full_name;																//default text is the text shown first, when page loads
	if(pos >= 0){																					//if its a ca, set default to discovery route
		default_text = disc_full_name;
	}

	var routes = '';
	routes +=				'<select class="routeSelect" name="routeSelect">';
	if(pos === -1) routes +=	'<option value="' + api_full_name + '">HTTP</option>';				//if its a ca, no api option
	routes +=					'<option value="' + disc_full_name + '">gRPC</option>';
	routes +=				'</select>';
	routes +=				'<span class="routeWrap bx--tooltip__top" data-tooltip="' + default_text +'">';
	routes +=					'<span class="routeTxt" full="' + default_text + '">' + default_text + '...</span>';
	routes +=				'</span>';
	routes +=				'<button class="copyButton copyButtonStyle" data-clipboard-text="' + default_text +'">Copy</button>';
	
	clone.find('.name').html(friendly_name(peer.id));
	clone.find('.routes').html(routes);
	
	if(peer.status !== GOOD_STATUS){
		clone.find('.stop_peer').addClass('disabledButton');
	}

	var discoveryHtml = '<div class="bx--tooltip__top" data-tooltip="Peer discovery data uknown">';
	discoveryHtml +=		 '<span id="discovery' + peer.id +'">?</span> / ' + total_peers;
	discoveryHtml +=	'</div>';

	clone.attr('peer', peer.id);
	clone.find('.discoveryCount').html(discoveryHtml);
	clone.find('.peer_status').html('loading');								//leave status blank, will use rest call to populate

	clone.addClass('actualPeer');											//used to remove built peers and keep sample
	clone.removeClass('sample').removeClass('sample_peer');
	$('#peerBody').append(clone);
	resize_peer_names();
	clone.show();
}

//resize the full peer name field
function resize_peer_names(){
	var width = $('.routes:last').width() - 198;
	width = Math.ceil(width / 5) * 5;								//round down to nearest xx
	if(width !== $('.routeWrap:last').width()){						//dont bother if width is the same
		$('.routeWrap').css('width', width + 'px');
		
		$('.routeTxt').each(function(){
			var name = $(this).attr('full');
			var perChar = 13;										//least characters

			if(width >= 600) perChar = 8;							//most characters, smaller # is more characters
			else if(width >= 250) perChar = 9;
			else if(width >= 115) perChar = 12;

			var chars =  width / perChar;
			if(chars < name.length) name = name.substring(0, chars) + '...';
			$(this).html(name);
		});
	}
}

//color code peer's status
function build_status(status, timer){
	var ret = '';
	if(status && status.toLowerCase() === GOOD_STATUS){
		ret = '<div class="peerStatus"></div> Running';
	}
	else if(status && status.toLowerCase() === CANT_GET_STATUS){
		ret = '-';
	}
	else if(status && status.toLowerCase() === MEH_STATUS){
		ret = '<div class="peerStatus peerStatusError"></div> Restarting';
		ret += '<div class="restart_timer">' + timer + '</div>';
	}
	else{
		ret = '<div class="peerStatus peerStatusError"></div> Stopped';
	}
	return ret;
}

//rest restaret peer
function rest_restart_peer(peer_name, cb) {
	var url = '/api/peer/' + peer_name + '/restart';
	$.ajax({
		url: url,
		cache: false
	}).done(function(data) {
		console.log('Success - sending restart', data);
		if(cb) cb(null, data);
	}).fail(function(e){
		console.log('Error - failed to send restart', e);
		if(cb) cb(e, null);
	});
}

//rest start peer
function rest_start_peer(peer_name, cb) {
	var url = '/api/peer/' + peer_name + '/start';
	$.ajax({
		url: url,
		cache: false
	}).done(function(data) {
		console.log('Success - sending start', data);
		if(cb) cb(null, data);
	}).fail(function(e){
		console.log('Error - failed to send start', e);
		if(cb) cb(e, null);
	});
}

//rest reset the network!
function rest_reset_network(cb) {
	console.log('resetting network');
	$.post('/api/network/' + network_id + '/reset')
		.done(function(data){
			console.log('Success - sending reset', data);
			setTimeout(function(){cb(null,{});}, 1000);
		})
		.fail(function(e){
			console.log('Error - failed to send reset', e);
			setTimeout(function(){cb(null,{});}, 1000);
		});
}

//rest get chaincode details
function rest_get_reset_status(cb) {
	console.log('getting reset status data');
	$.get('/api/network/' + network_id + '/reset/status')
		.done(function(data){
			console.log('Success - getting reset status', data);
			cb(null, data);
		})
		.fail(function(e){
			console.log('failed to get reset status');
			cb(e);
		});
}


// =================================================================================
// Other Stuff
// =================================================================================
//get known cc hashes for demo selection from broker
function rest_get_cc_hashses(cb){
	$.ajax({
		method: 'GET',
		url: window.location.origin + '/api/chaincode/demos/',
		contentType: 'application/json',
		success: function(json){
			console.log('Success - getting known cc hashes', json);
			if(cb) cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to get known cc hashes', e);
			if(cb) cb(e, null);
		}
	});
}

//convert string time to seconds, ie 1:45 = 105 sec
function convertTimeToSeconds(strTime) {
	if(strTime){
		var time = strTime.split(':');
		var seconds = 0;
		var multiplier = 1;

		for(var i = time.length - 1; i >= 0; i--) {
			seconds += Number(time[i]) * multiplier;
			multiplier *= 60;
		}
		return seconds;
	}
}

//convert seconds to string time, ie 105 secs to 1:45
function convertSecondsToTime(seconds) {
	seconds = Number(seconds);
	var strTime = '';
	var numberToAdd = 0;
	if(seconds === 0) {
		strTime = '00:00';
	}
	while(seconds >= 1) {
		if(!strTime) {
			numberToAdd = Number((seconds % 60).toFixed(0));
			strTime = ((numberToAdd > 9)?'':'0') + numberToAdd;
			seconds = Math.floor(seconds/60);
		} else {
			numberToAdd = Number((seconds % 60).toFixed(0));
			strTime = ((numberToAdd > 9)?'':'0') + numberToAdd + ':' + strTime;
			seconds = Math.floor(seconds/60);			
		}
	}
	
	if(strTime.indexOf(':') < 0) {
		strTime = '00:' + strTime;
	}
	
	return strTime;
}

//rest get env status
function rest_get_service_status(cb) {
	console.log('getting bluemix service status data');
	$.get('https://bluemix-service-status.blockchain.ibm.com/status')
		.done(function(data){
			console.log('Success - getting bluemix service status', data);
			cb(null, data);
		})
		.fail(function(e){
			console.log('Error - failed to get bluemix service status', e);
			cb(e);
		});
}

//pretty format date
function formatDate(date, fmt) {
	date = new Date(date);
	function pad(value) {
		return (value.toString().length < 2) ? '0' + value : value;
	}
	return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
		var tmp;
		switch (fmtCode) {
		case 'Y':								//Year
			return date.getUTCFullYear();
		case 'M':								//Month 0 padded
			return pad(date.getUTCMonth() + 1);
		case 'd':								//Date 0 padded
			return pad(date.getUTCDate());
		case 'H':								//24 Hour 0 padded
			return pad(date.getUTCHours());
		case 'I':								//12 Hour 0 padded
			tmp = date.getUTCHours();
			if(tmp === 0) tmp = 12;				//00:00 should be seen as 12:00am
			else if(tmp > 12) tmp -= 12;
			return pad(tmp);
		case 'p':								//am / pm
			tmp = date.getUTCHours();
			if(tmp >= 12) return 'pm';
			return 'am';
		case 'P':								//AM / PM
			tmp = date.getUTCHours();
			if(tmp >= 12) return 'PM';
			return 'AM';
		case 'm':								//Minutes 0 padded
			return pad(date.getUTCMinutes());
		case 's':								//Seconds 0 padded
			return pad(date.getUTCSeconds());
		case 'r':								//Milliseconds 0 padded
			return pad(date.getUTCMilliseconds(), 3);
		case 'q':								//UTC timestamp
			return date.getTime();
		default:
			throw new Error('Unsupported format code: ' + fmtCode);
		}
	});
}

//crappy escape html make safe thing
function escapeHtml(str) {
	str = str.replace(new RegExp('[<,>]', 'g'), '');
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

//capital first letter of each word
function toTitleCase(str){
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//take in hostname give back full ID
function parse_host_for_id(hostname, short){
	var pos = hostname.indexOf('_vp');
	if(pos >= 0){
		if(short) return hostname.substring(0, pos);	//return the ID that doesn't include '_vpx'
		else return hostname.substring(0, pos + 4);		//return the ID that still includes '_vpx'
	}
	else{
		pos = hostname.indexOf('_ca');
		if(short) return hostname.substring(0, pos-1);	//return the ID that doesn't include '_ca'
		else return hostname.substring(0, pos + 3);		//return the ID that still includes '_ca'
	}
}

//get peer shortname from cc id (return vpx)
function parse_4_peer_shortname(id){
	var envs = ['-vp', '_vp', '_ca'];							//list of sufixes
	var pos = -1;
	if(id && id.substring){
		for(var i in envs){
			pos = id.indexOf(envs[i]);
			if(pos >= 0) break;
		}
		if(pos >= 0){
			id = id.substring(pos + 1).toUpperCase();
		}
	}
	return id;											//invalid will fall through
}

//hide all popup modals
function hideGenericPopup(hideScreen){
	$('#transactional-modal').hide();
	$('#transactional-modal-innter').html('');
	$('#passive-modal').hide();
	$('#passive-modal-innter').html('');
	if(hideScreen) $('#modalScreen').fadeOut();
	pause_refresh = false;
}
