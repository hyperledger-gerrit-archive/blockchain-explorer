
if (!window.location.origin) {							
	window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}
svg4everybody();
var mobileNavOpen = false;
var closing_time = false;
var closing_time_timeout = Date.now() + 60 * 1000 * 1;	
var checkInterval = null;
var resume = [];
var ON_PAGE = 'invalid';
var path_parts = window.location.pathname.split('/');
if(path_parts[2] === 'v2' || path_parts[2] === 'v1') ON_PAGE = path_parts[3];
console.log('detecting user on page', ON_PAGE);
activate_page_js();
set_nav();

$(document).on('ready', function() {
	new Clipboard('.copyButton');						

	$('#closingButton').click(function(){
		$('#closingTimeWrap').fadeOut();
		$('#closingScreen').fadeOut();
		start_timer();									
		try{
			for(var i in resume){
				resume[i]();							
			}
		}
		catch(e){}
		resume = [];									
	});

	$(document).on('click', '.notificationClose', function(){	
		$(this).parent().fadeOut();
	});

	$(document).on('click', '.navLink', function() {
		deactivate_page_js();
		ON_PAGE = $(this).attr('act');
		if(ON_PAGE !== 'apis'){							
			activate_page_js();
			set_nav();

			var navStyleIsMobile = page_is_mobile();
			if(navStyleIsMobile){
				if(mobileNavOpen){
					console.log('hiding mobile nav options');
					$('.navLink').each(function(){							
						if(!$(this).hasClass('selectedPage')) $(this).fadeOut();
					});
					mobileNavOpen = false;
				}
			}
			return false;
		}
	});

	$(document).on('click', '.selectedPage', function() {				
		var navStyleIsMobile = page_is_mobile();

			if(navStyleIsMobile){
			if(mobileNavOpen){
				console.log('hiding mobile nav options');
				$('.navLink').each(function(){							
					if(!$(this).hasClass('selectedPage')) $(this).fadeOut();
				});
				mobileNavOpen = false;
			}
			else{
				console.log('showing mobile nav options');
				$('.navLink').fadeIn().css('display','block');
				mobileNavOpen = true;
			}
		}
		return false;
	});

	$(window).resize(function() {
		var navStyleIsMobile = page_is_mobile();

			if(navStyleIsMobile){
			$('.navLink').each(function(){								
				if(!$(this).hasClass('selectedPage')) $(this).hide();
			});
			mobileNavOpen = false;
		}
		else{
			$('.navLink').show().css('display','block');
			mobileNavOpen = false;
		}
	});

	function page_is_mobile(){
		var ret = false;
		if($('.selectedPage').width() > 300) ret = true; 				
		return ret;
	}


	start_timer();
	$(document).click(function(){
		reset_closing_time();
	});
	function start_timer(){
		reset_closing_time();
		checkInterval = setInterval(function(){check_timer();}, 30000);
	}

		function check_timer(){
		var time_left = closing_time_timeout - Date.now();
		if(time_left <= 0){
			console.log('its closing time');
			closing_time = true;

			try{
				if(blockheight_interval){
					clearInterval(blockheight_interval);
					resume.push(start_height_interval);
				}
			}
			catch(e){}

			try{
				if(check_if_refresh_interval){
					clearInterval(check_if_refresh_interval);
					resume.push(start_check_refresh_interval);
				}
				if(reset_status_interval){
					clearInterval(reset_status_interval);
					resume.push(start_reset_interval);
				}
			}
			catch(e){}

			$('#transactional-modal').hide();
			$('#transactional-modal-innter').html('');
			$('#passive-modal').hide();
			$('#passive-modal-innter').html('');
			$('#modalScreen').hide();

			$('#closingTimeWrap').fadeIn();
			$('#closingScreen').fadeIn();
			clearInterval(checkInterval);
		}
		else{
			console.log('sec till closing time', time_left/1000);
		}
	}

	function reset_closing_time(){
		closing_time_timeout = Date.now() + 60 * 1000 * 7;			
	}
});


function activate_page_js(){
	console.log('activating', ON_PAGE);
	if(ON_PAGE === 'network') activate_network_tab();
	else if(ON_PAGE === 'blockchain') activate_blockchain_tab();
	else if(ON_PAGE === 'demo') activate_demo_tab();
	else if(ON_PAGE === 'logs') activate_logs_tab();
	else if(ON_PAGE === 'service') activate_service_tab();
	else if(ON_PAGE === 'support') activate_support_tab();
	$('#loadingPageWrapper').hide();
}

function deactivate_page_js(){
	console.log('deactivating', ON_PAGE);
	if(ON_PAGE === 'network') deactivate_network_tab();
	else if(ON_PAGE === 'blockchain') deactivate_blockchain_tab();
	else if(ON_PAGE === 'demo') deactivate_demo_tab();
	else if(ON_PAGE === 'logs') deactivate_logs_tab();
	else if(ON_PAGE === 'service') deactivate_service_tab();
	else if(ON_PAGE === 'support') deactivate_support_tab();
}

function set_nav(){
	if(path_parts[2] === 'v2' || path_parts[2] === 'v1'){
		window.history.pushState({},'', '/' + path_parts[1] + '/' + path_parts[2]  + '/' + ON_PAGE +'/' + path_parts[4]);
	}
	$('.navLink').each(function(){										
		var link = $(this).attr('act');
		if(ON_PAGE === link){
			var html = '<svg class="selectedNavChev">';
			html 	+= 		'<use xlink:href="/img/icons/sprite.svg#support--arrow-right"></use>';
			html    += '</svg>';
			$(this).addClass('selectedPage').find('.selectedNavChevron').html(html);
		}
		else $(this).removeClass('selectedPage').find('.selectedNavChevron').html('');
	});
}


var reset_status_interval = null;
var pause_refresh = false;						
var GOOD_STATUS = 'running';
var MEH_STATUS = 'restarting';
var BAD_STATUS = 'stopped';
var CANT_GET_STATUS = 'unknown';

function rest_get_chaincode(cb) {
	var url = '/api/network/' + network_id + '/chaincodes';
	console.log('getting ' + url);
	$.ajax({
		method: 'GET',
		url: url,
		timeout: 30000,
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

function appendChaincodeTable(id, chaincode) {
	chaincode.sort(function(a, b) {								
		var textA = a.peer_id.toUpperCase();
		var textB = b.peer_id.toUpperCase();
		return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
	});
	console.log('adding chaincode', chaincode);
	var options = '';
	var clone_cc = $('#chaincode .sample_cc').clone();

	clone_cc.find('.upTime').html('');															
	for(var i in chaincode){
		options += '<option value="' + chaincode[i].peer_id + '">';
		options +=		parse_4_peer_shortname(chaincode[i].peer_id);
		options += '</option>';
		clone_cc.find('.upTime').append('<span class="ccUpTime ' + chaincode[i].peer_id + '">' + chaincode[i].status + '</span>');
	}

		var cc_id = '';
	cc_id +=		'<span class="ccidWrap bx--tooltip__top" data-tooltip="' + id +'">';
	cc_id +=			'<span class="ccTxt" full="' + id + '">' + id + '...</span>';
	cc_id +=		'</span>';
	cc_id +=		'<button class="copyButton copyButtonStyle" data-clipboard-text="' + id +'">' + lang.copy + '</button>';
	clone_cc.find('.ccIdTd').html(cc_id);

	clone_cc.find('.chaincode_peer_count').html(chaincode.length);
	clone_cc.find('.ccPeerSelect').html(options).attr('cc_id', id);
	clone_cc.find('.logs').attr('peer_id', chaincode[0].peer_id).attr('cc_id', id); 
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

function show_status(me){
	var peer_id = $(me).val();
	var cc_id = $(me).attr('cc_id');
	$('.ccUpTime').hide();
	$(me).next().attr('peer_id', peer_id).attr('cc_id', cc_id);
	$('.' + peer_id).show();
}

function rest_get_peers(cb) {
	console.log('getting /api/network/' + network_id + '/peers');
	$.ajax({
		method: 'GET',
		url: '/api/network/' + network_id + '/peers',
		timeout: 30000,
		headers: {
			Accept : 'application/json'
		},
		success: function(json){
			if(RUN_MODE === 'IBM-BCS'){
				for(var i = 0; i < 4; i++){
					json.peers[i+1].api_host ='6d034331-553b-409e-8c27-cd912434cbdf_vp' + i + '.us.blockchain.ibm.com';
					json.peers[i+1].api_port = 443;
					json.peers[i+1].tls = true;
				}
				json.user =	{
								enrollId: 'dashboarduser_type1_704279bb3f',
								enrollSecret: '8d7ad2f006'
							};
			}

							console.log('Success - getting peer status data', json);
			cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to get peer status data');
			cb(e);
		}
	});
}

function rest_get_ca(hostname, container_id, cb) {
	$.ajax({
		method: 'GET',
		url: '/api/network/' + network_id + '/ca/status',
		timeout: 30000,
		headers: { 
			Accept : 'application/json'
		},
		success: function(json){
			if(!json || !json.status){
				console.log('Error - failed to get ca status data');
				cb('no status field in resp', {id: container_id});
			}
			else{
				json.id = container_id;
				console.log('Success - getting ca status data');
				cb(null, json);
			}
		},
		error: function(e){
			console.log('Error - failed to get ca status data');
			cb(e, {id: container_id});									
		}
	});
}

function friendly_name(id){
	var pos = id.indexOf('_');
	var name = id.substring(pos + 1).toUpperCase();

	var i = id.indexOf('_vp');
	if(i >= 0){
		name = lang.validating_peer + ' ' + id.substring(i + 3);		
	}

		var m = id.indexOf('_ca');
	if (m >= 0){
		name = lang.membership_services;								
	}

	return name;
}

function appendPeerTable(peer, total_peers) {
	var clone = $('.sample_peer').clone().hide();
	var api_full_name = 'http://' + peer.api_host + ':' + peer.api_port;
	if(peer.tls === true) api_full_name = 'https://' + peer.api_host + ':' + peer.api_port;
	var disc_full_name = 'grpcs://' + peer.discovery_host + ':' + peer.discovery_port;

	var pos = peer.id.indexOf('_ca');
	var default_text = api_full_name;																
	if(pos >= 0){																					
		default_text = disc_full_name;
	}

	var routes = '';
	routes +=				'<select class="routeSelect" name="routeSelect">';
	if(pos === -1) routes +=	'<option value="' + api_full_name + '">HTTP</option>';				
	routes +=					'<option value="' + disc_full_name + '">gRPC</option>';
	routes +=				'</select>';
	routes +=				'<span class="routeWrap bx--tooltip__top" data-tooltip="' + default_text +'">';
	routes +=					'<span class="routeTxt" full="' + default_text + '">' + default_text + '...</span>';
	routes +=				'</span>';
	routes +=				'<button class="copyButton copyButtonStyle" data-clipboard-text="' + default_text +'">' + lang.copy +'</button>';

		clone.find('.name').html(friendly_name(peer.id));
	clone.find('.routes').html(routes);

		if(peer.status !== GOOD_STATUS){
		clone.find('.stop_peer').addClass('disabledButton');
	}

	var discoveryHtml = '<div class="bx--tooltip__top" data-tooltip="' + lang.discovery_tooltip + '">';
	discoveryHtml +=		 '<span id="discovery' + peer.id +'">?</span> / ' + total_peers;
	discoveryHtml +=	'</div>';

	clone.attr('peer', peer.id);
	clone.find('.discoveryCount').html(discoveryHtml);
	clone.find('.peer_status').html(lang.loading);							

	clone.addClass('actualPeer');											
	clone.removeClass('sample').removeClass('sample_peer');
	$('#peerBody').append(clone);
	resize_peer_names();
	clone.show();
}

function resize_peer_names(){
	var perChar = 7;												
	var width = $('.routes:last').width() - 105 - 21 - 55 - 30;
	width = Math.ceil(width / (perChar*3)) * (perChar*3);			
	$('.routeTxt').each(function(){
		var name = $(this).attr('full');
		var chars =  (width - 15) / perChar;					
		if(chars < name.length) name = name.substring(0, chars-4) + '...';

		var span_name = '';										
		for(var i in name) span_name += '<span class="fixedWidth">' + name[i] + '</span>';

		$(this).html(span_name);								
		$(this).parent().css('width', width + 'px');			
		$('#debug').html(width);
	});
}

function build_status(status, timer){
	var ret = '';
	if(status && status.toLowerCase() === GOOD_STATUS){
		ret = '<div class="peerStatus"></div> ' + lang.status_running;
	}
	else if(status && status.toLowerCase() === CANT_GET_STATUS){
		ret = '-';
	}
	else if(status && status.toLowerCase() === MEH_STATUS){
		ret = '<div class="peerStatus peerStatusError"></div> ' + lang.status_restarting;
		ret += '<div class="restart_timer">' + timer + '</div>';
	}
	else{
		ret = '<div class="peerStatus peerStatusError"></div> ' + lang.status_stopped;
	}
	return ret;
}

function rest_restart_peer(peer_name, cb) {
	var url = '/api/peer/' + peer_name + '/restart';
	$.ajax({
		url: url,
		timeout: 30000,
		cache: false
	}).done(function(data) {
		console.log('Success - sending restart', data);
		if(cb) cb(null, data);
	}).fail(function(e){
		console.log('Error - failed to send restart', e);
		if(cb) cb(e, null);
	});
}

function rest_start_peer(peer_name, cb) {
	var url = '/api/peer/' + peer_name + '/start';
	$.ajax({
		url: url,
		timeout: 30000,
		cache: false
	}).done(function(data) {
		console.log('Success - sending start', data);
		if(cb) cb(null, data);
	}).fail(function(e){
		console.log('Error - failed to send start', e);
		if(cb) cb(e, null);
	});
}

function rest_reset_network(cb) {
	console.log('resetting network');
	$.ajax({
		method: 'POST',
		url: '/api/network/' + network_id + '/reset',
		timeout: 30000,
		headers: { 
			Accept : 'application/json'
		},
		success: function(json){
			console.log('Success - sending reset', json);
			setTimeout(function(){cb(null,{});}, 1000);
		},
		error: function(e){
			console.log('Error - failed to send reset', e);
			setTimeout(function(){cb(null,{});}, 1000);
		}
	});
}

function rest_get_reset_status(cb) {
	console.log('getting reset status data');
	$.ajax({
		method: 'GET',
		url: '/api/network/' + network_id + '/reset/status',
		timeout: 30000,
		headers: { 
			Accept : 'application/json'
		},
		success: function(json){
			console.log('Success - getting reset status', json);
			cb(null, json);
		},
		error: function(e){
			console.log('failed to get reset status');
			cb(e);
		}
	});
}


function rest_get_cc_hashses(cb){
	$.ajax({
		method: 'GET',
		url: window.location.origin + '/api/chaincode/demos/',
		timeout: 30000,
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

function rest_get_service_status(cb) {
	console.log('getting bluemix service status data');
	$.ajax({
		method: 'GET',
		url: 'https://bluemix-service-status.blockchain.ibm.com/status',
		timeout: 30000,
		headers: { 
			Accept : 'application/json'
		},
		success: function(json){
			console.log('Success - getting bluemix service status', json);
			cb(null, json);
		},
		error: function(e){
			console.log('Error - failed to get bluemix service status', e);
			cb(e);
		}
	});
}

function formatDate(date, fmt) {
	date = new Date(date);
	function pad(value) {
		return (value.toString().length < 2) ? '0' + value : value;
	}
	return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
		var tmp;
		switch (fmtCode) {
		case 'Y':								
			return date.getUTCFullYear();
		case 'M':								
			return pad(date.getUTCMonth() + 1);
		case 'd':								
			return pad(date.getUTCDate());
		case 'H':								
			return pad(date.getUTCHours());
		case 'I':								
			tmp = date.getUTCHours();
			if(tmp === 0) tmp = 12;				
			else if(tmp > 12) tmp -= 12;
			return pad(tmp);
		case 'p':								
			tmp = date.getUTCHours();
			if(tmp >= 12) return 'pm';
			return 'am';
		case 'P':								
			tmp = date.getUTCHours();
			if(tmp >= 12) return 'PM';
			return 'AM';
		case 'm':								
			return pad(date.getUTCMinutes());
		case 's':								
			return pad(date.getUTCSeconds());
		case 'r':								
			return pad(date.getUTCMilliseconds(), 3);
		case 'q':								
			return date.getTime();
		default:
			throw new Error('Unsupported format code: ' + fmtCode);
		}
	});
}

function escapeHtml(str) {
	str = str.replace(new RegExp('[<,>]', 'g'), '');
	var div = document.createElement('div');
	div.appendChild(document.createTextNode(str));
	return div.innerHTML;
}

function toTitleCase(str){
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function parse_host_for_id(hostname, short){
	var pos = hostname.indexOf('_vp');
	if(pos >= 0){
		if(short) return hostname.substring(0, pos);	
		else return hostname.substring(0, pos + 4);		
	}
	else{
		pos = hostname.indexOf('_ca');
		if(short) return hostname.substring(0, pos-1);	
		else return hostname.substring(0, pos + 3);		
	}
}

function parse_4_peer_shortname(id){
	var envs = ['-vp', '_vp', '_ca'];							
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
	return id;											
}

function hideGenericPopup(hideScreen){
	$('#transactional-modal').hide();
	$('#transactional-modal-innter').html('');
	$('#passive-modal').hide();
	$('#passive-modal-innter').html('');
	if(hideScreen) $('#modalScreen').fadeOut();
	pause_refresh = false;
}


function peer_rest_get_peers(host, port, tls, i, cb){
	console.log('peer_rest_get_peers()');
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';

	if(!host || !port || isNaN(port)){
		if(cb) cb({error: 'no host or port'}, {shortname: i});
	}
	else{
		$.ajax({
			method: 'GET',
			url: proto + '://' + host.trim() + ':' + Number(port) + '/network/peers',
			timeout: 20000,
			contentType: 'application/json',
			success: function(json){
				json.peers.sort(function(a, b) {										
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
			timeout: 20000,
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
			timeout: 20000,
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
			timeout: 15000,
			method: 'GET',
			url: url,
			success: function(json){
				json.id = peer_id;
				console.log('Success - getting peer\'s chain data', json);
				if(cb) cb(null, json);
			},
			error: function(e){
				console.log('Error - failed to get chain data');
				if(cb) cb(e, {id: parse_host_for_id(host)});				
			}
		});
	}
}

function peer_rest_blockstats(host, port, tls, height, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chain/blocks/' + height;
	console.log('peer_rest_blockstats()', parse_4_peer_shortname(peer_id));

	$.ajax({
		method: 'GET',
		url: url,
		timeout: 20000,
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

function peer_rest_deploy(host, port, tls, data, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chaincode';

	$.ajax({
		method: 'POST',
		url: url,
		timeout: 20000,
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

function peer_rest_invoke(host, port, tls, data, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chaincode';

	$.ajax({
		method: 'POST',
		url: url,
		timeout: 20000,
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

function peer_rest_query(host, port, tls, data, peer_id, cb){
	var proto = 'http';
	if(tls === true) proto = 'https';
	if(tls === 'https') proto = 'https';
	var url = proto + '://' + host.trim() + ':' + Number(port) + '/chaincode';

	$.ajax({
		method: 'POST',
		url: url,
		timeout: 20000,
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


var bag = 	{
				peers: [], 
				chain: {}, 
				stats:{
					chain_height: 0,
					oldest_blk_queried: 9999999999,
					session_blk_count: 0,
					trans: 0,
					deploys: 0,
					invokes: 0,
				}
			};
var selected_peer = 0;
var get_last = 10;								
var known_blocks = {};
var blockheight_interval = null;
var last = 0;									
var count = 0;									
var next = 0;
var goingDown = false;

var TYPE_DEPLOY = 1;
var TYPE_INVOKE = 2;
var TYPE_QUERY = 3;								
var TYPE_TERMINATE = 4;							

var loadMoreRowHtml =  '<tr id="loadMore" class="blockchainTabRow">';
	loadMoreRowHtml += 		'<td colspan="5">' + lang.load_more + '</td>';
	loadMoreRowHtml +=	'</tr>';


function activate_blockchain_tab(){
	$('#blockchain_content').fadeIn(200);
	$('#loadingSpinner').show();
	rest_get_peers(function cb_got_audit(e, resp){
		if(e != null) {
			console.log('error getting peers');
			$('#loadingSpinner').hide();
		}
		else {
			bag.peers = [];
			for(var i in resp.peers){
				if(resp.peers[i].api_host.indexOf('_vp') >= 0) bag.peers.push(resp.peers[i]);
			}
			rest_chainstats(cb_got_chainstats);
		}
	});

	start_height_interval();
}

function deactivate_blockchain_tab(){
	$('#blockchain_content').hide();
	clearInterval(blockheight_interval);
}





$(document).on('ready', function() {
	$(document).on('click', '#loadMore', function(){
		console.log('starting at', bag.stats.oldest_blk_queried);
		last = bag.stats.oldest_blk_queried;							
		count = 0;														
		$('#loadMore').remove();
		get_prev_blocks();												
		return false;
	});

		$(document).on('click', '.blockchainTabRow', function(){			
		var height = $(this).attr('blockheight');
		if(height){
			build_block_details_row(height);
			$('.selectedBlock').removeClass('selectedBlock');
			$(this).addClass('selectedBlock');
		}
	});

	$(window).resize(function() {
		resizeTable();
		setTimeout(function() {										
			resizeTable();
		}, 300);
	});
});


function start_height_interval(){
	if(bag && bag.peers && bag.peers.length > 0) rest_chainstats(cb_got_chainstats);	
	blockheight_interval = setInterval(function(){
		check_height();
	}, 10000);
}

function check_height(){
	rest_chainstats(cb_got_chainstats);
	$('.dateText').each(function(){
		var i = $(this).attr('blockheight');
		if(known_blocks[i] && known_blocks[i].transactions > 0){
			$(this).html(formatTime(known_blocks[i].transactions[0].timestamp.seconds) + ' <br/>' + lang.ago);
		}
	});
}

function cb_got_chainstats(e, resp){
	$('#loadingSpinner').fadeOut();
	if(e != null){
		$('#loadingTxt').html(lang.could_not_contact);
		$('#loadingRow').show();
		$('#userTipRow').remove();
		$('#blockchainPeer').html('[ ! ]');
		resizeTable();
	}
	else {
		console.log('responses block height', resp.height);
		console.log('known block height    ', bag.stats.chain_height);
		console.log('next block height     ', next);

		if(resp.height > bag.stats.chain_height){
			console.log('- new block!');
			bag.chain = resp;
			if(next === 0) next = resp.height - get_last + 1;							
			if(next < 0) next = 0;

						if(bag.stats.chain_height > 0 && next > bag.stats.chain_height + 1){		
				next = bag.stats.chain_height + 1;
				console.log('!fixing next block height  ', next);
			}

			rest_blockstats(next, get_blocks);
		}
		if(resp.height === 0 || next === 0) $('#loadMore').remove();	
		if(resp.height === 0){
			$('#loadingTxt').html(lang.genesis);
			$('#loadingRow').show();
		}
	}
}

function get_blocks(e, block){
	if(e == null){
		next++;
		if(next <= bag.chain.height){
			rest_blockstats(next, get_blocks);
		}
		else{
			$('#loadMore').remove();									
			if(bag.stats.oldest_blk_queried > 1){
				$('#activityBody').append(loadMoreRowHtml);
			}
		}
	}
}


function resizeTable(){
	var display = $('#blockDetailsTable').css('display');
	if(display === 'inline-block'){							
		var new_width = $('.blockWrap').width() - 470;
		$('#blockDetailsTable').css('width', new_width + 'px');
	}
}

function get_prev_blocks(){
	last--;
	count++;
	if(count < get_last){												
		if(last > 0){
			goingDown = true;
			rest_blockstats(last, get_prev_blocks);						
		}
		else {
			goingDown = false;
		}
	}
	else {
		goingDown = false;
		$('#activityBody').append(loadMoreRowHtml);
	}
}


function build_chain_row(block){
	var html = '';
	var time = '';
	var deploys = 0;
	var invokes = 0;
	if(block){
		if(block.transactions && block.transactions[0]) {
			for(var i in block.transactions){
				if(block.transactions[i].type === TYPE_DEPLOY) deploys++;
				if(block.transactions[i].type === TYPE_INVOKE) invokes++;
			}
		}

				if(block.nonHashData && block.nonHashData.localLedgerCommitTimestamp) {
			time = formatTime(block.nonHashData.localLedgerCommitTimestamp.seconds);
		}

		var css = '';
		if(block.height == bag.stats.chain_height) {
			css = 'firstBlock';													
			$('.firstBlock').removeClass('firstBlock');							
		}

				if(block.height === 0){													
			html += '<tr class="blockchainTabRow" blockheight="' + block.height + '">';
			html += 	'<td><div class="blockIcon ' + css + '"></td>';
			html +=		'<td class="blockTime">' + time + ' ' + lang.ago + '</td>';
			html +=		'<td>0</td>';
			html +=		'<td>Genesis</td>';
			html +=		'<td></td>';
			html +=	'</tr>';
		}
		else{																	
			html += '<tr class="blockchainTabRow" blockheight="' + block.height + '">';
			html += 	'<td><div class="blockIcon ' + css + '"></td>';
			html +=		'<td class="blockTime">' + time + ' ' + lang.ago + '</td>';
			html +=		'<td>' + block.height + '</td>';
			html +=		'<td>' + deploys + '</td>';
			html +=		'<td>' + invokes + '</td>';
			html +=	'</tr>';
		}

			$('#loadingRow').hide();												

				if(goingDown){
			$('#activityBody').append(html);									
		}
		else{
			$('#activityBody').prepend(html);									
		}
		resizeTable();
	}
}

function build_block_details_row(height){
	var html = '';

	for(var i in known_blocks[height].transactions){
		var ccid = atob(known_blocks[height].transactions[i].chaincodeID);
		var payload = atob(known_blocks[height].transactions[i].payload);
		var pos = payload.indexOf(ccid);
		var uuid = known_blocks[height].transactions[i].uuid;
		var encrypted = false;
		var displayccid = ccid;
		if(pos === -1) encrypted = true;
		if(encrypted){																	
			payload = '(' + lang.encrypted + ') ' + known_blocks[height].transactions[i].payload;	
			displayccid = '(' + lang.encrypted + ') ' + known_blocks[height].transactions[i].chaincodeID;
		}
		else{
			payload = payload.substring(pos + ccid.length + 2);
		}
		if(known_blocks[height].transactions[i].type == TYPE_DEPLOY) {					
			uuid = 'n/a &nbsp;&nbsp;';
			if(!encrypted) displayccid = known_blocks[height].transactions[i].uuid;
		}
		else if(!encrypted) displayccid = ccid.substring(0, 14) + '...';

		html += '<tr>';
		html +=		'<td style="word-break: break-word;">';
		html +=			formatDate(known_blocks[height].transactions[i].timestamp.seconds * 1000, '%M/%d %I:%m%p') + ' UTC';
		html +=		'</td>';
		html += 	'<td class="uppercaseMe">' + type2word(known_blocks[height].transactions[i].type) + '</td>';
		html += 	'<td>' + uuid + '</td>';
		html += 	'<td><div>' + displayccid + '</div></td>';
		html += 	'<td>' + payload + '</td>';
		html += '</tr>';
	}
	$('#detailsBody').html(html);
}

function type2word(type){
	if(type === TYPE_DEPLOY) return lang.deploy;											
	if(type === TYPE_INVOKE) return lang.invoke;
	if(type === TYPE_QUERY) return lang.query;
	if(type === TYPE_TERMINATE) return lang.terminate;
	return type;
}

function add2stats(block){
	if(block && block.height && block.transactions){
		bag.stats.session_blk_count++;
		if(block.height > bag.stats.chain_height) bag.stats.chain_height = block.height;
		if(block.height < bag.stats.oldest_blk_queried) bag.stats.oldest_blk_queried = block.height;

				for(var i in block.transactions){
			if(block.transactions[i].type === TYPE_DEPLOY) bag.stats.deploys++;
			if(block.transactions[i].type === TYPE_INVOKE) bag.stats.invokes++;
		}

				var total_count = 0;
		var firstBlockTimestamp = Date.now() / 1000;
		var lastBlockTimstamp = 0;
		for(i in known_blocks){														
			if(known_blocks[i].nonHashData && known_blocks[i].nonHashData.localLedgerCommitTimestamp) {
				total_count++;

				if(known_blocks[i].nonHashData.localLedgerCommitTimestamp.seconds < firstBlockTimestamp) {
					firstBlockTimestamp = known_blocks[i].nonHashData.localLedgerCommitTimestamp.seconds;
				}
				if(known_blocks[i].nonHashData.localLedgerCommitTimestamp.seconds > lastBlockTimstamp) { 
					lastBlockTimstamp = known_blocks[i].nonHashData.localLedgerCommitTimestamp.seconds;
				}
			}
		}

				var elasped_hour = (lastBlockTimstamp - firstBlockTimestamp) / 60 / 60;
		var rate = 0;
		if(elasped_hour > 0) rate = total_count / elasped_hour;

				$('#blockHeight').html(Number(bag.stats.chain_height) + 1);
		$('#blockDeploys').html(bag.stats.deploys);
		$('#blockInvokes').html(bag.stats.invokes);
		$('#blockRate').html(rate.toFixed(1));
		$('#blockTrans').html( ((bag.stats.deploys + bag.stats.invokes) / bag.stats.session_blk_count).toFixed(1) );
		$('.sessionBlocks').html(Number(bag.stats.session_blk_count) + 1);

		scaleText();
	}
}

function scaleText(){
	var fontSize = 40;
	for(fontSize = 40; $('#blockHeight').width() > 90; --fontSize) $('#blockHeight').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockDeploys').width() > 40; --fontSize) $('#blockDeploys').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockInvokes').width() > 40; --fontSize) $('#blockInvokes').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockRate').width() > 90; --fontSize) $('#blockRate').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockTrans').width() > 80; --fontSize) $('#blockTrans').css('font-size', fontSize + 'px');
}


function rest_chainstats(cb){
	if(selected_peer >= bag.peers.length){
		console.log('Error - tried all peers, no good', selected_peer, '/', bag.peers.length);
		selected_peer = 0;
		if(cb) return cb({error: 'no good'}, null);
	}
	else{
		var host = bag.peers[selected_peer].api_host;
		var port = bag.peers[selected_peer].api_port;
		var tls = bag.peers[selected_peer].tls;

		peer_rest_get_blockheight(host, port, tls, selected_peer, function(err, json){
			if(err != null){
				console.log('Error - failed to get chainstats on peer', selected_peer, 'trying next one', err);
				selected_peer++;
				return rest_chainstats(cb);
			}
			else{
				json.height--;
				console.log('Success - getting chainstats on peer', selected_peer);
				$('#blockchainPeer').html('[ ' + lang.connected_to + ' ' + friendly_name(bag.peers[selected_peer].id) + ' ]');
				if(cb) cb(null, json);
			}
		});
	}
}

function rest_blockstats(height, cb){
	console.log('getting blockstats @ height', height);
	var host = bag.peers[selected_peer].api_host;
	var port = bag.peers[selected_peer].api_port;
	var tls = bag.peers[selected_peer].tls;

	peer_rest_blockstats(host, port, tls, height, selected_peer, function(err, block){
		if(err != null){
			console.log('Error - failed to get blockstats @ height:', height, err);
			if(cb) cb(err, null);
		}
		else{
			console.log('Success - getting blockstats @ height:', height);
			block.height = height;

						if(!known_blocks[block.height]){
				known_blocks[block.height] = block;									
				add2stats(block);
				build_chain_row(block);													
			}
			else{
				known_blocks[block.height] = block;									
			}

						if(cb) cb(null, block);
		}
	});
}


function formatTime(ms){
	var elasped = Math.floor((Date.now() - ms*1000) / 1000);
	var str = '';
	var levels = 0;

		if(elasped >= 60*60*24){
		levels++;
		str =  Math.floor(elasped / (60*60*24)) + lang.days + ' ';
		elasped = elasped % (60*60*24);
	}
	if(elasped >= 60*60){
		levels++;
		if(levels < 2){
			str =  Math.floor(elasped / (60*60)) + lang.hr + ' ';
			elasped = elasped % (60*60);
		}
	}
	if(elasped >= 60){
		if(levels < 2){
			levels++;
			str +=  Math.floor(elasped / 60) + lang.min + ' ';
			elasped = elasped % 60;
		}
	}
	if(levels < 2){
		str +=  elasped + lang.sec + ' ';
	}

		return str;
}

function formatDate(date, fmt) {
	date = new Date(date);
	function pad(value) {
		return (value.toString().length < 2) ? '0' + value : value;
	}
	return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
		var tmp;
		switch (fmtCode) {
		case 'Y':								
			return date.getUTCFullYear();
		case 'M':								
			return pad(date.getUTCMonth() + 1);
		case 'd':								
			return pad(date.getUTCDate());
		case 'H':								
			return pad(date.getUTCHours());
		case 'I':								
			tmp = date.getUTCHours();
			if(tmp === 0) tmp = 12;				
			else if(tmp > 12) tmp -= 12;
			return pad(tmp);
		case 'p':								
			tmp = date.getUTCHours();
			if(tmp >= 12) return lang.time_pm;
			return lang.time_am;
		case 'P':								
			tmp = date.getUTCHours();
			if(tmp >= 12) return lang.time_pm.toUpperCase();
			return  lang.time_am.toUpperCase();
		case 'm':								
			return pad(date.getUTCMinutes());
		case 's':								
			return pad(date.getUTCSeconds());
		case 'r':								
			return pad(date.getUTCMilliseconds(), 3);
		case 'q':								
			return date.getTime();
		default:
			throw new Error('Unsupported format code: ' + fmtCode);
		}
	});
}


var user = null, peer = null;
var tab = '&nbsp;&nbsp;';
var cc_hashes = {};
var known_ccs = {};
var logger = {							
				log: function(a, b, c){
					var temp = '';
					if(typeof a === 'object') temp += '<pre>' + JSON.stringify(a, null, 4) + ' </pre>';
					else if(a.indexOf('Success') >= 0 || a.indexOf('Error') >= 0) temp += tab + a + ' ';
					else if(a) temp += a + ' ';
					if(typeof b === 'object') temp += '<pre>' + JSON.stringify(b, null, 4) + ' </pre>';
					else if(b)  temp += b + ' ';
					if(typeof c === 'object') temp += '<pre>' + JSON.stringify(c, null, 4) + ' </pre>';
					else if(c)  temp += c + ' ';
					$('#demoLogs').append(temp + '<br/>');
					$('#demoLogs').scrollTop($('#demoLogs')[0].scrollHeight);
				}
			};
var paper_name = 'demo_paper';
var users_account = 'demo_account1';
var other_account = 'demo_account2';

function activate_demo_tab(){
	$('#demo_content').fadeIn(200);
	$('.notificationWrap').hide();
	$('.demoLoading').fadeIn();
	rest_get_cc_hashses(function(e, resp){					
		if(e == null) known_ccs = resp;

		rest_get_peers(function(e, data){
			if(data){
				user = data.user;
				peer = data.peers[1];						
			}
			if(user && peer) {
				check_enroll_id();							
			}
		});
	});
}

function deactivate_demo_tab(){
	$('#demo_content').hide();
}

$(document).on('ready', function() {
	$('.showActions').click(function(){
		var panel = $(this).parent().parent().find('.demoActionWrap');
		if($(panel).is(':visible')){
			$(panel).fadeOut();
			$(this).html(lang.show_actions);
		}
		else{
			$('.showActions').html(lang.show_actions);
			$('.demoActionWrap').fadeOut();									
			$(panel).fadeIn();
			$(this).html(lang.hide_actions);
		}
	});

		$('input[name="showAPIdetails"]').click(function(){
		showOrHideDetails();
	});

		$('#clearLogs').click(function(){
		$('#demoLogs').html('');
	});

		$('.deployButton').click(function(){
		var cc = $(this).attr('cc');
		$('#' + cc + 'Loading').fadeIn();
		var map = 	{														
						example02: {
							git: 'https://github.com/masterDev1985/hyperledger_chaincode/chaincode_example02',
							func: 'init',
							args: ['a', '100', 'b', '200']
						},
						marbles: {
							git: 'https://github.com/ibm-blockchain/marbles-chaincode/hyperledger/part2',
							func: 'init',
							args: ['12345']
						},
						cp: {
							git: 'https://github.com/IBM-Blockchain/cp-chaincode-v2/hyperledger',
							func: 'init',
							args: []
						}
					};

				if(map[cc]){
			console.log('deploying cc', map[cc]);
			rest_deploy(map[cc].git, map[cc].func, map[cc].args, user.enrollId, function(e, data){
				$('.' + cc).fadeIn();							
				$('.showActions[cc="' + cc + '"]').html(lang.hide_actions);
				$('#' + cc + 'Loading').fadeOut();
				if(data.result){
					cc_hashes[data.result.message] = true;
					build_cc_options(cc_hashes);
					$('.' + cc).fadeIn();						
					show_next_step(2);
				}
			});
		}
	});

	$('select[name="demo_chaincode_name"]').change(function(){
		var demo = $(this).attr('cc');
		enableOptions(demo);
	});

	$('.selectAction').change(function(){
		enableExecuteButtons();									
	});

	$('.executeAction').click(function(){
		var this_ex = $(this).attr('cc');
		var action = $('.selectAction[cc="' + this_ex +'"]').val();
		console.log(this_ex, 'action is', action);

		switch(action){
			case 'invokeA2B': invokeA2B(); break;
			case 'invokeB2A': invokeB2A(); break;
			case 'queryA': queryA(); break;
			case 'queryB': queryB(); break;

			case 'createMarble': createMarble(); break;
			case 'transferMarble': transferMarble(); break;
			case 'delMarble': delMarble(); break;
			case 'queryMarble': queryMarble(); break;

			case 'regAcount': regAcount(); break;
			case 'issuePaper': issuePaper(); break;
			case 'buyPaper': buyPaper(); break;
			case 'queryAccount': queryAccount(); break;
		}
	});

	function invokeA2B(){													
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_invoke_peer(hash, 'invoke', ['a', 'b', '5'], user.enrollId, function(){
			show_next_step(3);
			$('#example02Loading').fadeOut();
		});
	}
	function invokeB2A(){													
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_invoke_peer(hash, 'invoke', ['b', 'a', '5'], user.enrollId, function(){
			show_next_step(3);
			$('#example02Loading').fadeOut();
		});
	}
	function queryA(){														
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_query_peer(hash, 'query', ['a'], user.enrollId, false, function(){
			show_next_step(4);
			$('#example02Loading').fadeOut();
		});
	}
	function queryB(){														
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_query_peer(hash, 'query', ['b'], user.enrollId, false, function(){
			show_next_step(4);
			$('#example02Loading').fadeOut();
		});
	}

	function createMarble(){												
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_invoke_peer(hash, 'init_marble', ['demo_marble', 'blue', '35', 'bob'], user.enrollId, function(){
			show_next_step(3);
			$('#transferMarble').prop('disabled', false);
			$('#delMarble').prop('disabled', false);
			$('#marblesLoading').fadeOut();
		});
	}
	function transferMarble(){												
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_invoke_peer(hash, 'set_user', ['demo_marble', 'leroy'], user.enrollId, function(){
			show_next_step(3);
			$('#marblesLoading').fadeOut();
		});
	}
	function delMarble(){													
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_invoke_peer(hash, 'delete', ['demo_marble'], user.enrollId, function(){
			show_next_step(3);
			$('#marblesLoading').fadeOut();
		});
	}
	function queryMarble(){													
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_query_peer(hash, 'read', ['demo_marble'], user.enrollId, false, function(){
			show_next_step(4);
			$('#marblesLoading').fadeOut();
		});
	}

	function regAcount(){													
		$('#cpLoading').fadeIn();
		var hash = $('select[cc="cp"]').val();
		rest_invoke_peer(hash, 'createAccount', [users_account], user.enrollId, function(){
			show_next_step(3);
		});
		rest_invoke_peer(hash, 'createAccount', [other_account], user.enrollId, function(){
			show_next_step(3);
			$('#buyPaper').prop('disabled', false);
			$('#issuePaper').prop('disabled', false);
			$('#cpLoading').fadeOut();
		});
	}
	function issuePaper(){													
		$('#cpLoading').fadeIn();
		var hash = $('select[cc="cp"]').val();
		var obj = 	{
						ticker:  paper_name,
						par: 1000000,
						qty: 3,
						discount: 7.5,
						maturity: 30,
						owner: [],
						issuer: other_account,
						issueDate: Date.now().toString()
					};
		rest_invoke_peer(hash, 'issueCommercialPaper', [JSON.stringify(obj)], user.enrollId, function(){
			show_next_step(3);
			$('#cpLoading').fadeOut();
		});
	}
	function buyPaper(){													
		$('#cpLoading').fadeIn();
		var hash = $('select[cc="cp"]').val();

		logger.log(lang.query_cp_msg);
		rest_query_peer(hash, 'query', ['GetAllCPs'], user.enrollId, false, function(e, data){
			try{
				data = JSON.parse(data.result.message);						
			}
			catch(e){
				console.log('cannot parse GetAllCPs response', e);
			}

			if(data && data[0] && data[0].cusip){
				var obj = 	{
					CUSIP: data[0].cusip,									
					fromCompany: other_account,
					toCompany: users_account,
					quantity: 1
				};
				rest_invoke_peer(hash, 'transferPaper', [JSON.stringify(obj)], user.enrollId, function(){
					show_next_step(3);
					$('#cpLoading').fadeOut();
				});
			}
		});
	}
	function queryAccount(){												
		$('#cpLoading').fadeIn();
		var hash = $('select[cc="cp"]').val();
		rest_query_peer(hash, 'query', ['GetCompany', users_account], user.enrollId, false, function(){
			show_next_step(4);
			$('#cpLoading').fadeOut();
		});
	}
});


function rest_deploy(gogit, func, args, enrollId, cb){
	var color = '#AF6EE8';
	logger.log(lang.deploying_chaincode, gogit);
	var data = {
					'jsonrpc': '2.0',
					'method': 'deploy',
					'params': {
						'type': 1,
						'chaincodeID': {
							'path': gogit
						},
						'ctorMsg': {
							'function': func,
							'args': args
						},
						'secureContext': enrollId
					},
					'id': 1
				};
	var url = 'https://' + peer.api_host + ':' + peer.api_port + '/chaincode';
	log_api_req(color, 'POST', url, data);

		peer_rest_deploy(peer.api_host, peer.api_port, peer.tls, data, peer.id, function(err, json){
		if(err != null){
			console.log('Error - failed to deploy', err);
			logger.log(lang.deploying_error, err);
			if(cb) cb(err, null);
		}
		else{
			console.log('Success - deployment', json);
			logger.log(lang.deploying_success);
			log_api_resp(color, json);
			setTimeout(function(){
				logger.log(tab + lang.done);
				if(cb) cb(null, json);
			}, 50000);
		}
	});
}

function build_rest_body(hash, type, func, args, enrollId){
	return 	{																		
				'jsonrpc': '2.0',
				'method': type,
					'params': {
					'type': 1,
					'chaincodeID': {
						'name': hash
					},
					'ctorMsg': {
						'function': func,
							'args': args
					},
					'secureContext': enrollId
				},
				'id': 1
			};
}

function rest_invoke_peer(hash, func, args, enrollId, cb){
	var color = '#8a8a8a';
	logger.log(lang.invoking_chaincode + ' -', func);
	var data = build_rest_body(hash, 'invoke', func, args, enrollId);
	var url = 'https://' + peer.api_host + ':' + peer.api_port + '/chaincode';
	log_api_req(color, 'POST', url, data);

	peer_rest_invoke(peer.api_host, peer.api_port, peer.tls, data, peer.id, function(err, json){
		if(err != null){
			console.log('Error - failed invocation', err);
			logger.log(lang.invocation_error, err);
			if(cb) cb(err, null);
		}
		else{
			console.log('Success - invocation', json);
			if(json && json.result && json.result.message) logger.log(lang.invocation_success, json.result.message);
			else logger.log(lang.invocation_success);
			log_api_resp(color, json);
			if(cb) cb(null, json);
		}
	});
}

function rest_query_peer(hash, func, args, enrollId, quietly, cb){
	if(!quietly) logger.log(lang.querying_chaincode + ' -', func, JSON.stringify(args));
	var data = build_rest_body(hash, 'query', func, args, enrollId);
	var url = 'https://' + peer.api_host + ':' + peer.api_port + '/chaincode';
	if(!quietly) log_api_req('#00B29F', 'POST', url, data);

		peer_rest_query(peer.api_host, peer.api_port, peer.tls, data, peer.id, function(err, json){
		if(err != null){
			if(!quietly){
				console.log('Error - failed query', err);
				logger.log(lang.query_error, err);
			}
			if(cb) cb(err, null);
		}
		else{
			if(!quietly) {
				console.log('Success - query', json);
				if(json && json.result && json.result.message) {
					logger.log(lang.success, json.result.message);
				}
				else logger.log(lang.query_error2);
				log_api_resp('#00B29F', json);
			}
			if(cb) cb(null, json);
		}
	});
}

function check_enroll_id(){
	var color = '#3ce251';
	$('.demoLoading').fadeIn();
	logger.log(lang.checking_enrollid, user.enrollId);
	var proto = 'http';
	if(peer.tls === true) proto = 'https';
	if(peer.tls === 'https') proto = 'https';
	var url = proto + '://' + peer.api_host + ':' + Number(peer.api_port) + '/registrar/' + user.enrollId;

	log_api_req(color, 'GET', url, null);
	peer_rest_get_registrar(peer.api_host, peer.api_port, peer.tls, user.enrollId, function(err, json){
		if(err !== null){
			logger.log(lang.id_not_reg);
			log_api_resp(color, json);
			register_enrolld_id();
		}
		else {
			logger.log(tab + lang.id_is_reg);
			log_api_resp(color, json);
			rdy_for_user();
		}
	});
}

function register_enrolld_id(){
	var color = '#5AAAFA';
	$('.demoLoading').fadeIn();
	logger.log(lang.registering_enrollid, user.enrollId);
	var url = 'https://' + peer.api_host + ':' + peer.api_port + '/registrar';
	var log_data = {
					enrollId: user.enrollId,
					enrollSecret: user.enrollSecret
				};
	log_api_req(color, 'POST', url, log_data);
	peer_rest_post_registrar(peer.api_host, peer.api_port, peer.tls, user.enrollId, user.enrollSecret, function(err, json){
		if(err != null){
			logger.log(lang.register_failed, err);
			$('.demoLoading').fadeOut();
			var html = 	'<div style="color:#f51212">';
			html +=			lang.register_failed2 + ' :(';
			html +=			'<br/>';
			html += 		tab + tab + tab + tab + '- ' + lang.register_failed3;
			html +=		'</div>';
			logger.log(html);
		}
		else {
			logger.log(lang.register_success);
			log_api_resp(color, json);
			rdy_for_user();
		}
	});
}


function rdy_for_user(){
	$('.demoLoading').fadeOut();
	$('.deployButton').prop('disabled', false);					
	enableExecuteButtons();

	for(var hash in known_ccs) {
		if(known_ccs[hash] === 'example02') test_if_example02_cc_exists(hash);
		else if(known_ccs[hash] === 'marbles') test_if_marbles_cc_exists(hash);
		else if(known_ccs[hash] === 'cp') test_if_cp_cc_exists(hash);
	}
}

function log_api_req(color, method, path, body){
	var html = 	'<div class="apiDetails" style="color:' + color +'">';
	html +=			'<div class="apiReq">HTTP ' + method.toUpperCase() + ' ' + path + '</div>';
	if(body) html +='<pre>' + JSON.stringify(body, null, 4) + ' </pre>';
	html +=		'</div>';
	$('#demoLogs').append(html);
	showOrHideDetails();
}

function log_api_resp(color, resp){
	var html = 	'<div class="apiDetails" style="color:' + color +'">';
	html +=			tab + tab + 'Response<pre>' + escapeHtml(JSON.stringify(resp, null, 4)) + ' </pre>';
	html +=		'</div>';
	$('#demoLogs').append(html);
	$('#demoLogs').append('<br/>');
	showOrHideDetails();
}

function build_cc_options(hashes){
	console.log('deployed cc hashes', hashes);
	for(var y in known_ccs){										
		var html = '';
		for(var i in hashes){
			var nickname = '?';
			var selectMe = '';
			var disable = '';
			for(var x in known_ccs) {
				if(x === i) nickname = known_ccs[x];				
			}
			if(nickname === '?' || nickname === known_ccs[y]){		
				if(selectMe === '' && nickname === known_ccs[y]) selectMe = 'selected="selected"';
				if(known_ccs[y] === 'invalid') disable = 'disabled="disabled"';
				html += '<option value="' + i + '" ' + selectMe +' ' + disable + '>' + nickname + ': ' + i.substr(0, 8) + '...</option>';
			}
		}

		if(html === '') html = '<option disabled="disabled" selected="selected">' + lang.invalid.toLowerCase() + '</option>';
		$('.selectCC[cc="' +  known_ccs[y] +'"]').html(html);
		enableOptions(known_ccs[y]);
	}
}

var deployTimer = null, invokeTimer = null, queryTimer = null;
function show_next_step(step){
	if(step == 2){
		$('.deployHelperText').fadeIn();
		clearTimeout(deployTimer);
		deployTimer = setTimeout(function(){$('.deployHelperText').fadeOut();}, 10000);
	}
	if(step == 3){
		$('.invokeHelperText').fadeIn();
		clearTimeout(invokeTimer);
		invokeTimer = setTimeout(function(){$('.invokeHelperText').fadeOut();}, 10000);
	}
	if(step == 4){
		$('.queryHelperText').fadeIn();
		clearTimeout(queryTimer);
		queryTimer = setTimeout(function(){$('.queryHelperText').fadeOut();}, 10000);
	}
}

function showOrHideDetails(){
	if($('input[name="showAPIdetails"]').is(':checked')){
		$('.apiDetails').fadeIn();
	}
	else{
		$('.apiDetails').fadeOut();
	}
	$('#demoLogs').scrollTop($('#demoLogs')[0].scrollHeight);
}

function enableOptions(demo){
	if($('select[cc="' + demo +'"]').val()){
		if(demo === 'example02'){
			$('#invokeA2B').prop('disabled', false);
			$('#invokeB2A').prop('disabled', false);
			$('#queryA').prop('disabled', false);
			$('#queryB').prop('disabled', false);
		}
		else if(demo === 'marbles'){
			$('#createMarble').prop('disabled', false);
			$('#queryMarble').prop('disabled', false);
		}
		else if(demo === 'cp'){
			$('#regAcount').prop('disabled', false);
			$('#queryAccount').prop('disabled', false);
		}
	}
	enableExecuteButtons();
}

function enableExecuteButtons(demo){
	$('.selectCC').each(function(){
		var this_ex = $(this).attr('cc');
		var selected_cc = $('select[cc="' + this_ex  +'"]').val();
		var selected_action = $('.selectAction[cc="' + this_ex +'"]').val();

		if(selected_cc && selected_action){
			$('.executeAction[cc="' + this_ex  +'"]').prop('disabled', false);
		}
		else $('.executeAction[cc="' + this_ex  +'"]').prop('disabled', true);
	});
}

function test_if_example02_cc_exists(hash){
	rest_query_peer(hash, 'query', ['a'], user.enrollId, true, function(err, resp){
		if(resp && resp.result && resp.result.status){
			console.log('found this cc for example02', hash.substring(0,8), resp);
			cc_hashes[hash] = true;
			build_cc_options(cc_hashes);
		}
		else console.log('did NOT find this cc for example02', hash.substring(0,8), resp);
	});
}

function test_if_marbles_cc_exists(hash){
	rest_query_peer(hash, 'read', ['demo_marble'], user.enrollId, true, function(err, resp){
		if(resp && resp.result && resp.result.status){
			console.log('found this cc for marbles', hash.substring(0,8), resp);
			cc_hashes[hash] = true;
			build_cc_options(cc_hashes);
		}
		else console.log('did NOT find this cc for marbles', hash.substring(0,8), resp);
	});
}

function test_if_cp_cc_exists(hash){
	rest_query_peer(hash, 'query', ['GetCompany', users_account], user.enrollId, true, function(err, resp){
		if(resp && resp.result && resp.result.status){
			console.log('found this cc for cpweb', hash.substring(0,8), resp);
			cc_hashes[hash] = true;
			build_cc_options(cc_hashes);
		}
		else console.log('did NOT find this cc for cpweb', hash.substring(0,8), resp);
	});
}


function activate_logs_tab(){
	$('#logs_content').fadeIn(200);
	$('#demo_loading').show();
	rest_get_peers(function(err, data){
		if(err == null){
			build_peer_buttons(data.peers);
		}
	});
}

function deactivate_logs_tab(){
	$('#logs_content').hide();
}





function build_peer_buttons(peers){
	var html = '';

	for(var i in peers){
		html += '<div>';
		html += 	'<div class="logButtonTitle"> ' + friendly_name(peers[i].id) + '</div>';
		html += 	'<button class="bx--btn peerLogButton" peer_id="' + peers[i].id +'">';
		html += 	'<span>' + lang.logs +'</span>';
		html += 		'<svg class="peerLogIcon">';
		html += 			'<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/img/icons/sprite.svg#app-actions--go_to_icon"></use>';
		html +=			'</svg>';
		html += 	'</button>';
		html += '</div>';
	}
	$('#logButtonWrap').html(html);
}

$(document).on('ready', function() {
	$(document).on('click', '.peerLogButton', function(){
		var peer_id = $(this).attr('peer_id');
		window.open('/api/peer/' + peer_id + '/logs');
	});
});


var check_if_refresh_interval = null;
var known_peers = {};							


function activate_network_tab(){
	$('#network_content').fadeIn(200);
	$('#refreshWrap').show();
	updateStats();
	start_check_refresh_interval();								
}

function deactivate_network_tab(){
	$('#network_content').hide();
	$('#refreshWrap').hide();
	clearInterval(check_if_refresh_interval);
}





$(document).on('ready', function() {
	var variables = {
						auto_refresh: {
							min: 8,
							max: 360
						}
					};
	var addRule = (function(style){
		style.appendChild(document.createTextNode(''));
		var sheet = document.head.appendChild(style).sheet;
		return function(selector, css){
			var propText = Object.keys(css).map(function(p){
				return p + ':' + css[p];
			}).join(';');
			sheet.insertRule(selector + '{' + propText + '}', sheet.cssRules.length);
		};
	})(document.createElement('style'));

	$('#reBar').on('input', function() {
		var percent = Math.ceil(((this.value - this.min) / (this.max - this.min)) * 100);

		var value = ((variables.auto_refresh.max - variables.auto_refresh.min) * (percent/100)) + variables.auto_refresh.min;
		$('#time').html(convertSecondsToTime(value));
		$('#time_left').html(convertSecondsToTime(value));

				if(navigator.userAgent.indexOf('Chrome') >= 0) {
			addRule('input[type=range]::-webkit-slider-runnable-track', {
				background: '-webkit-linear-gradient(left, #5AAAFA ' + percent + '%, #5AAAFA ' + percent + '%, #2B323A ' + percent + '%)'
			});
		}

				if(navigator.userAgent.indexOf('Firefox') >= 0) {
			addRule('input[type=range]::-moz-range-track', {
				background: 'linear-gradient(to right, #5AAAFA ' + percent + '%, #5AAAFA ' + percent + '%, #2B323A ' + percent + '%)'
			});
		}
	});

	$(document).on('click', '.logs', function() {
		var addr = '/api/peer/' + $(this).attr('peer_id') + '/chaincode/' + $(this).attr('cc_id') + '/logs';
		console.log('addr', addr);
		var win = window.open(addr, '_blank');
		if(win){											
			win.focus();
		}
		else{												
			alert('Please allow popups for this site');
		}
	});




	$(document).on('click', '.start_peer', function() {
		pause_refresh = true;
		if($(this).hasClass('disabledButton')) return false;
		var peer_name = $(this).parent().parent().attr('peer');
		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'<svg class="notifcationAlt modal-icon">';
		html +=				'<use xlink:href="/img/icons/sprite.svg#notifications--info"></use>';
		html +=			'</svg>';
		html +=			lang.start;
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody">';
		html += 		'<p>' + lang.start_msg +' <span class="highlightName">' + peer_name + '</span>?</p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary" type="button" data-modal-close=""> ' + lang.cancel +' </button>';
		html +=		'<button id="confirmedStart" class="bx--btn" type="button" data-modal-close="" peer="' + peer_name + '"> ' + lang.yes + ' </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});

	$(document).on('click', '#confirmedStart', function() {
		hideGenericPopup(true);
		var peer_name = $(this).attr('peer');
		$('#loadingSpinner').show();
		pause_refresh = true;

		rest_start_peer(peer_name, function(e, resp){
			if(e != null){
				setTimeout(function(){updateStats();}, 2000);
			}
			else{
				var secs = 75;
				process_status(peer_name, MEH_STATUS, secs);
				setTimeout(function(){updateStats();}, (secs - 5) * 1000);									
			}
		});
	});

	$(document).on('click', '.stop_peer', function() {
		pause_refresh = true;
		if($(this).hasClass('disabledButton')) return false;
		var peer_name = $(this).parent().parent().attr('peer');
		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'<svg class="notifcationWarning modal-icon">';
		html +=				'<use xlink:href="/img/icons/sprite.svg#common--warning"></use>';
		html +=			'</svg>';
		html +=			lang.stop_warning;
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody">';
		html += 		'<p>' + lang.stop_msg + ' <span class="highlightName">' + peer_name + '</span>?</p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary2" type="button" data-modal-close=""> ' + lang.cancel + ' </button>';
		html +=		'<button id="confirmedStopPeer" class="bx--btn" type="button" data-modal-close="" peer="' + peer_name + '"> ' + lang.yes + ' </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});

	$(document).on('click', '#confirmedStopPeer', function() {
		hideGenericPopup(true);
		var peer_name = $(this).attr('peer');
		var url = '/api/peer/' + peer_name + '/stop';
		console.log('stopping peer', peer_name);
		$('#loadingSpinner').show();

		$.ajax({
			url: url,
			timeout: 30000,
			cache: false
		}).done(function(data) {
			console.log('Success - sending stop', data);
			$('#loadingSpinner').hide();
			process_status(peer_name, BAD_STATUS, null);
		}).fail(function(e){
			$('#loadingSpinner').hide();
			console.log('Error - failed to send stop', e);
		});
	});

	$('#reset_network').click(function() {
		pause_refresh = true;
		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'<svg class="notifcationWarning modal-icon">';
		html +=				'<use xlink:href="/img/icons/sprite.svg#common--warning"></use>';
		html +=			'</svg>';
		html +=			'Reset Warning';
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody">';
		html +=			'<p> ' + lang.reset_msg1 + '</p>';
		html += 		'<p> ' + lang.reset_msg2 + '</p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary2" type="button" data-modal-close=""> ' + lang.cancel +' </button>';
		html +=		'<button id="confirmedResetNetwork" class="bx--btn" type="button" data-modal-close=""> ' + lang.yes + ' </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});

	$(document).on('click', '#confirmedResetNetwork', function() {
		show_reset();														
		send_reset();
	});

	$(document).on('click', '#closePopup', function() {
		hideGenericPopup(true);
	});

	$(document).on('mouseover', '#refreshPanel', function() {
		$('#reBar').fadeIn();
	});

	$(document).on('mouseleave', '#refreshPanel', function() {
		$('#reBar').fadeOut();
	});

	$(document).on('change', '.ccPeerSelect', function() {
		show_status(this);
	});

	$(window).resize(function() {
		resize_peer_names();
		resize_cc_ids();
		setTimeout(function() {								
			resize_peer_names();
			resize_cc_ids();
		}, 500);
	});

	$(document).on('change', 'select[name="routeSelect"]', function() {
		var full = $(this).val();
		$(this).parent().find('.routeWrap').find('.routeTxt').html(full).attr('full', full);
		$(this).parent().find('.routeWrap').attr('data-tooltip', full);
		$(this).parent().find('.copyButton').attr('data-clipboard-text', full);
		resize_peer_names();
	});

	$(document).on('click', '.peerNotificationClose', function(){
		$(this).parent().fadeOut(300);
		var that = this;
		setTimeout(function(){$(that).parent().remove();}, 300);
	});
});



function updateChaincodeTable() {
	rest_get_chaincode(function(e, chaincodes){
		$('.actualCC').remove();
		var found = false;
		for(var hash in chaincodes) {
			appendChaincodeTable(hash, chaincodes[hash]);
			found = true;
		}
		resize_cc_ids();
		setTimeout(function(){resize_cc_ids();}, 1000);	

		if(!found){
			var html = '<tr class="actualCC">';
			html +=			'<td>' + lang.no_chaincode_found +'</td>';
			html +=			'<td></td>';
			html +=			'<td></td>';
			html +=		'</tr>';
			$('#chaincode tbody').append(html);
		}
	});
}

function updatePeerTable() {
	$('#loadingSpinner').show();
	pause_refresh = true;
	rest_get_peers(function(e, resp){
		pause_refresh = false;
		if(e != null){
			$('#loadingSpinner').hide();
			var html = '<tr>';
			html += 		'<td colspan=9>';
			html += 			'<em>';
			html +=					lang.no_peers_error_msg;
			html +=				'</em>';
			html +=			'</td>';
			html +=		'</tr>';
			$('#peerBody').html(html);
		}
		else{
			$('#loadingSpinner').hide();
			$('.actualPeer').remove();									

			if(resp.reset){
				console.log('reset hint', resp.reset);
				show_reset();
			}

			for(var i in resp.peers) {									
				appendPeerTable(resp.peers[i], resp.peers.length - 1);	
				if(!resp.reset){
					process_container(resp.peers[i], resp);				
				}
			}
		}
	});
}

function process_container(container, network_data){
	if(container.type === 'ca'){
		$('#discovery'+ container.id).parent().html('-');				
		if(network_data.swarm && network_data.swarm.name !== 'yeti'){
			rest_get_ca(container.api_host, container.id, function(err, data){
				console.log('ca status data', data);
				if(!data || data.status !== GOOD_STATUS){
					process_status(data.id, BAD_STATUS, null);
				}
				else{
					process_status(data.id, GOOD_STATUS, '-');
				}
			});
		}
		else{
			process_status(container.id, CANT_GET_STATUS, '-');	
		}
	}

	else{
		peer_rest_get_peers(container.api_host, container.api_port, container.tls, container.id, updateDiscoveryColumn);
		blockheight_repeat(container.api_host, container.api_port, container.tls, container.id, 1);
	}
}

function updateDiscoveryColumn(err, json){
	if(err == null){
		var tooltip = lang.discovery_tooltip2 + ': ';
		for(var i in json.peers){
			if(Number(i) === json.peers.length - 1) tooltip += '& ' + json.peers[i].ID.name.toUpperCase();
			else tooltip += json.peers[i].ID.name.toUpperCase() + ', ';
		}
		$('#discovery'+ json.shortname).html(json.peers.length).parent().attr('data-tooltip', tooltip);
	}
}

function blockheight_repeat(api_host, api_port, tls, id, attempt){
	peer_rest_get_blockheight(api_host, api_port, tls, id, function(err, resp){
		if(err != null){
			if(attempt <= 1){
				console.log('status - failed on', parse_4_peer_shortname(id), ', [WILL TRY AGAIN]');
				return setTimeout(function(){ blockheight_repeat(api_host, api_port, tls, id, ++attempt);}, 1000);	
			}
			else process_status(resp.id, BAD_STATUS, null);													

		}
		else{
			process_status(resp.id, GOOD_STATUS, resp.height, resp.currentBlockHash);						
		}
	});
}

function process_status(peer_id, status, height, hash){
	console.log('status -', parse_4_peer_shortname(peer_id), status, ', height:', height);
	if(!hash) hash = '-';
	else hash = hash.substring(0, 6) + '...';

	if(status === GOOD_STATUS){
		$('tr[peer="' + peer_id + '"]').find('.blckheight').html(height).attr('data-tooltip', lang.block + ': ' + hash);
		$('tr[peer="' + peer_id + '"]').find('.peer_status').html(build_status(status));
		$('tr[peer="' + peer_id + '"]').find('.stop_peer').removeClass('disabledButton');
		$('tr[peer="' + peer_id + '"]').find('.start_peer').addClass('disabledButton');
	}
	else if(status === CANT_GET_STATUS){
		$('tr[peer="' + peer_id + '"]').find('.blckheight').html('-');
		$('tr[peer="' + peer_id + '"]').find('.peer_status').html(build_status(status));
		$('tr[peer="' + peer_id + '"]').find('.stop_peer').removeClass('disabledButton');
		$('tr[peer="' + peer_id + '"]').find('.start_peer').removeClass('disabledButton');
	}
	else{
		var secs = height;																					
		$('tr[peer="' + peer_id + '"]').find('.blckheight').html('-');
		$('tr[peer="' + peer_id + '"]').find('.peer_status').html(build_status(status, secs));
		$('tr[peer="' + peer_id + '"]').find('.stop_peer').addClass('disabledButton');
		$('tr[peer="' + peer_id + '"]').find('.start_peer').removeClass('disabledButton');
	}
	resize_peer_names();
	peer_notification(peer_id, status);
}

function updateStats() {
	console.log('updateStats() - fired');
	updateChaincodeTable();
	updatePeerTable();
}

function start_check_refresh_interval(){
	check_if_refresh_interval = setInterval(updateTimerAndStats, 1000);
}

function updateTimerAndStats() {
	if(!pause_refresh){
		var time_left = convertTimeToSeconds($('#time_left').html());
		time_left--;
		if(time_left === 0) {
			$('#time_left').html($('#time').html());
			updateStats();
		} else {
			time_left = convertSecondsToTime(time_left);
			$('#time_left').html(time_left);
		}
	}
	$('.restart_timer').each(function(){					
		var left = $(this).html();
		if(left > 0) left--;
		$(this).html(left);
	});
}


function send_reset(){
	console.log('sending reset req');
	rest_reset_network(function(e, data){
		if(e != null){																		
			console.log('Error sending request');
			var html = '';
			html += '<div class="bx--modal-content">';
			html +=		'<h2 class="bx--modal-content__heading">';
			html +=			lang.reset;
			html +=		'</h2>';
			html +=		'<svg class="bx--modal__close--icon">';
			html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
			html +=		'</svg>';
			html +=		'<div class="bx--modal-content__text" id="popupBody" style="text-align:center;">';
			html +=			'<p>' + lang.reset_error + '</p>';
			html +=			'<div id="reset_loading_bar_wrap">';
			html +=				'<div id="reset_loading_bar" style="width: 1%;"></div>';
			html +=			'</div>';
			html +=			'<div id="reset_loading_percent">0% ' + lang.complete + '..</div>';
			html +=		'</div>';
			html +=	'</div>';
			$('#passive-modal-innter').html(html);
			show_reset({error: e});
			clearInterval(reset_status_interval);
			reset_status_interval = null;
		}
		else{
			show_reset();																	
		}
	});
}

function fill_loading_bar(barSelector, textSelector, percent, cb){
	$(barSelector).animate({width: (percent + '%')}, 2000, function(){

				if(percent < 100){
			$(textSelector).html(percent + '% ' + lang.complete + '..');
		}
		else{																
			var html = '';
			html += '<div class="bx--modal-content">';
			html +=		'<h2 class="bx--modal-content__heading">';
			html +=			lang.reset;
			html +=		'</h2>';
			html +=		'<svg class="bx--modal__close--icon">';
			html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
			html +=		'</svg>';
			html +=		'<div class="bx--modal-content__text" id="popupBody" style="text-align:center;">';
			html +=			'<p>' + lang.reset_success +'</p>';
			html +=			'<div id="reset_loading_bar_wrap">';
			html +=				'<div id="reset_loading_bar" style="width: 100%;"></div>';
			html +=			'</div>';
			html +=			'<div id="reset_loading_percent">100% ' + lang.complete + '</div>';
			html +=		'</div>';
			html +=	'</div>';
			$('#passive-modal-innter').html(html);
			$('#passive-modal').css('border-color', '#7cc7ff').fadeIn();
			$(textSelector).html(percent + '% ' + lang.complete);			
			clearInterval(reset_status_interval);
			updatePeerTable();												
			updateChaincodeTable();											
			reset_status_interval = null;
			pause_refresh = false;
		}
		if(cb) cb();
	});
}

function show_reset(error){
	pause_refresh = true;
	if(!$('#reset_loading_bar_wrap').is(':visible')){						
		hideGenericPopup();

		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			lang.reset;
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody" style="text-align:center;">';
		html +=			'<p id="resetTxt">' + lang.resetting_msg + '</p>';
		html +=			'<div id="reset_loading_bar_wrap">';
		html +=				'<div id="reset_loading_bar" style="width: 1%;"></div>';
		html +=			'</div>';
		html +=			'<div id="reset_loading_percent">0% ' + lang.complete  + '..</div>';
		html +=			'<br/><br/>';
		html +=		'</div>';
		html +=	'</div>';
		$('#passive-modal-innter').html(html);
		$('#passive-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	}

	if(reset_status_interval === null && error == null){
		start_reset_interval();
		fill_loading_bar('#reset_loading_bar', '#reset_loading_percent', 10);			
	}
}

function start_reset_interval(){
	reset_status_interval = setInterval(function(){										
		rest_get_reset_status(handle_reset_status);
	}, 5000);
}

function handle_reset_status(e, data){
	console.log('reset status', data);
	if(e == null) {
		fill_loading_bar('#reset_loading_bar', '#reset_loading_percent', data.percent);	

		if(data.deleted_timestamp === -1 || data.finished_timestamp === -1){ 			
			var html = 	'<p>';
			html +=			lang.reset_error2;
			html +=		'</p>';
			$('#resetTxt').append(html);
			clearInterval(reset_status_interval);
			reset_status_interval = null;
			console.log('Error! - reset had an error, lets try again');
			setTimeout(function(){send_reset();}, 4000);
		}
	}
}

function resize_cc_ids(){
	var width = $('.ccIdTd:last').width() - 55 - 40;
	$('.ccidWrap').css('width', width + 'px');
	$('.ccTxt').each(function(){
		var name = $(this).attr('full');
		var chars =  width / 9;
		if(chars < name.length) name = name.substring(0, chars) + '...';
		$(this).html(name);
	});
}

function peer_notification(peer_id, status){
	var found = false;
	var id = 0;
	for(id in known_peers) {										
		if(id === peer_id){
			found = true;
			break;
		}
	}
	if(found && known_peers[id] !== status && status != MEH_STATUS){
		build_peer_notification(status, peer_id);
	}
	known_peers[peer_id] = status;									
}

function build_peer_notification(status, id){
	var html = '';
	var css_id = 'np-' + Date.now();
	if(status === GOOD_STATUS){
		html += '<div id="' + css_id + '" class="notificationWrap notifcationSuccess peerNotification">';
		html +=		'<svg class="notificationImg notifcationSuccess peerNotificationFix">';
		html +=			'<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/img/icons/sprite.svg#common--healthy"></use>';
		html +=		'</svg>';
		html +=	'<div class="notificationBody">';
		html +=		'<strong>&nbsp; ' + lang.success + ': &nbsp;</strong>';
		html +=		'<span>' + friendly_name(id) + ' has started.</span>';
		html +=	'</div>';
		html +=	'<svg class="peerNotificationClose peerNotificationFix">';
		html +=		'<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=	'</svg>';
	}
	else{
		html += '<div id="' + css_id + '" class="notificationWrap notifcationWarning peerNotification">';
		html +=		'<svg class="notificationImg notifcationWarning peerNotificationFix">';
		html +=			'<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/img/icons/sprite.svg#common--warning"></use>';
		html +=		'</svg>';
		html +=	'<div class="notificationBody">';
		html +=		'<strong>&nbsp; ' + lang.warning + ': &nbsp;</strong>';
		html +=		'<span>' + friendly_name(id) + ' has stopped.</span>';
		html +=	'</div>';
		html +=	'<svg class="peerNotificationClose peerNotificationFix">';
		html +=		'<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=	'</svg>';
	}
	$('#networkNotifications').append(html);

	var tooMany = $('.notificationWrap').size() - 4;
	$('.notificationWrap').each(function(){
		if(tooMany > 0) {
			tooMany--;
			$(this).fadeOut().remove();									
		}
	});

	$('#' + css_id).show().animate({'opacity': 1}, 500, function(){});			
}


var status_data = {};
var myChart;
var ts_start = 0;									
var ts_stop = Date.now();							
var serviceObj = {
			id: 'serviceCircle',
			value:			0,
			maxValue:		100,
			radius:     	60,
			showPercentage:	true
	};
var	networkObj = {
			id: 'networkCircle',
			value:			0,
			maxValue:		100,
			radius:     	60,
			showPercentage:	true
	};
var	testingkObj = {
			id: 'testingCircle',
			value:			0,
			maxValue:		0,
			radius:     	60,
			showPercentage:	false
	};

var temp = new Date();
temp.setUTCHours(0,0,0,0);
ts_start = temp.getTime();													
ts_stop = Date.now();														

Circles.create(serviceObj);
Circles.create(networkObj);
Circles.create(testingkObj);

function activate_service_tab(){
	$('#service_content').fadeIn(200);

	console.log('on env', ZONE);
	var prettyEnv = {'prod': lang.production, 'stage': lang.staging, 'dev': lang.development};
	$('#envText').html(prettyEnv[ZONE]);

	rest_get_service_status(function(e, data){
		$('#statusSpinner').fadeOut();
		if(e == null){
			console.log('got status data', data);
			status_data = data;

			build_all_circle_graphs();
			build_status_msgs(status_data.messages);
			build_histogram_graph(data);
			build_release_notes(status_data.release_notes);
		}
	});
}

function deactivate_service_tab(){
	$('#service_content').hide();
}





$(document).on('ready', function() {
	$('input[name="status_range"]').change(function(){
		var range = $(this).val();
		var temp = new Date();
		console.log('selected range', range);

		if(range === 'today'){
			temp.setUTCHours(0,0,0,0);
			ts_start = temp.getTime();
			ts_stop = Date.now();
		}
		else if(range === 'week'){												
			temp.setUTCDate(temp.getUTCDate() - 6);
			temp.setUTCHours(0,0,0,0);
			ts_start = temp.getTime();
			ts_stop = Date.now();
		}
		else if(range === 'month'){												
			temp.setUTCDate(1);
			ts_start = temp.getTime();
			ts_stop = Date.now();
		}
		else if(range === 'lastMonth'){											
			temp.setUTCDate(1);
			temp.setUTCMonth(temp.getUTCMonth() - 1);
			ts_start = temp.getTime();

						temp = new Date();
			temp.setUTCDate(0);
			ts_stop = temp.getTime();
		}
		else{
			console.log('no matches');
		}

				build_all_circle_graphs();												
	});
});


function build_all_circle_graphs(){
	build_circle_graphs(serviceObj, status_data[ZONE].logs.creation);
	build_circle_graphs(networkObj, status_data[ZONE].logs.keeper);
	build_circle_graphs(testingkObj, status_data[ZONE].logs.creation.concat(status_data[ZONE].logs.keeper.concat(status_data[ZONE].logs.docker)));
}

function build_circle_graphs(obj, logs){
	var successes = 0;
	var errors = 0;

		for(var i in logs){													
		var dt = new Date(Date.parse(logs[i].date));
		if(dt.getTime() >= ts_start && dt.getTime() < ts_stop){
			errors += logs[i].error;
			successes += logs[i].success;
		}
	}
	var total = errors + successes;
	var perGood = 100;
	if(total > 0) perGood = successes / total * 100;
	perGood = perGood.toFixed(0);
	console.log(obj.id, perGood, '% success', successes, total);

	obj.value = perGood;
	obj.maxValue = 100;
	if(!obj.showPercentage) {
		obj.value = successes;
		obj.maxValue = total;
	}
	Circles.create(obj);

	if(perGood >= 93){
		$('#' + obj.id).find('.circles-wrp svg .circles-valueStroke').removeClass('statusWarning').removeClass('statusFailing');
	}
	else if(perGood >= 79){
		$('#' + obj.id).find('.circles-wrp svg .circles-valueStroke').removeClass('statusFailing').addClass('statusWarning');
	}
	else {
		$('#' + obj.id).find('.circles-wrp svg .circles-valueStroke').removeClass('statusWarning').addClass('statusFailing');
	}
}

function build_histogram_graph(data){
	var ctx = document.getElementById('statusChart').getContext('2d');			
	Chart.defaults.global.defaultFontColor = '#8c9ba5';
	var histo = [];
	var labels = [];

	for(var i in data[ZONE].logs.histo.labels){									
		histo.push(Math.floor(data[ZONE].logs.histo.val[i]));
		labels[i] = formatDate(data[ZONE].logs.histo.labels[i], '%H:%m');
	}
	var chart_data = 	{														
							labels: labels,
							datasets: [
								{
									label: '% ' + lang.success,
									backgroundColor: 'rgba(86,155,227,.5)',
									borderColor: 'rgba(86,155,227,1)',
									radius: 4,
									pointBorderColor: 'rgba(86,155,227,1)',
									pointBackgroundColor: '#fff',
									pointHoverBackgroundColor: 'rgba(86,155,227,1)',
									pointHoverBorderColor: 'rgba(68,104,134,1)',
									data: histo
								}
							]
						};
	var options = 	{
						title:{
							display: false
						},
						legend: {
							display: false
						},
						tooltipTemplate: '<%= value %>%',
						scales: {
							yAxes: [{
								gridLines: {color: '#5a6872'},
								ticks: {
									beginAtZero: true,
									max: 100,
									showTooltips: true,
								}
							}],
							xAxes: [{
								gridLines: {color: '#5a6872'},
								labels: {
									fontColor: 'rgb(255, 255, 255)'
								}
							}]
						}
					};
	myChart = new Chart(ctx, {type: 'line', data: chart_data, options: options});
}

function build_status_msgs(messages){
	var html = '';
	var msgEnv = {'prod': 'production', 'stage': 'staging', 'dev': 'development'};
	var prettyEnv = {'production': lang.production, 'staging': lang.staging, 'development': lang.development, 'general': lang.general};
	for(var i in messages){
		var status = 'generalStatus';
		if(messages[i].doc.env === msgEnv[ZONE]) status = 'altStatus';
		if(messages[i].doc.env ===  msgEnv[ZONE] || messages[i].doc.env === 'general'){
			html += '<div class="messagesWrap">';
			html += 	'<div class="messageEnv ' + status + '"> ' + prettyEnv[messages[i].doc.env] +' </div>';
			html +=		'<div class="messageInnerWrap">';
			html +=			'<div class="notes">' + escapeHtml(messages[i].doc.text) + '</div>';
			html +=			'<div class="redate">' + formatDate(messages[i].doc.timestamp, '%M/%d %I:%m %p UTC') + '</div>';
			html +=		'</div>';
			html += '</div>';
		}
	}
	$('#messageWrap').html('').append(html);
}

function find_release_note_for_a_network(release_notes, network_broker_ver, network_timestamp){
	var note = {version: null};
	for(var i in release_notes){
		var iter_note = release_notes[i].doc;

		if(network_broker_ver && network_broker_ver.length > 2){		
			console.log(iter_note.version, '===', network_broker_ver);
			if(network_broker_ver === iter_note.version){
				note = release_notes[i].doc;
				break;
			}
		}
		else{															
			var ts_release = new Date(iter_note.date).getTime();
			console.log(iter_note.version, iter_note.date, '- days elasped:', (network_timestamp - ts_release)/1000/60/60/24);
			if(network_timestamp >= ts_release){
				note = release_notes[i].doc;
				break;
			}
		}
	}

	console.log('interm release note version', note.version);
	if(note.broker_upgraded){											
		console.log('valid broker upgrade for network!');
		return find_release_note_for_a_network(release_notes, note.broker_upgraded, null);
	}
	else return note.version;
}

function build_release_notes(release_notes){
	var html = '';

		var version4network = find_release_note_for_a_network(release_notes, 'v' + broker_ver, network_timestamp);
	if(version4network) $('#statusVer').html(version4network);
	else $('#statusVer').html(status_data[ZONE].version);				
	console.log('found release note version', version4network);

	for(var i in release_notes){
		var thisVersion = false;
		var note = release_notes[i].doc;
		var pos = note.commit.lastIndexOf('/') + 1;

		if(note.version === version4network){
			thisVersion = true;
		}

		html += '<div class="releaseNotesWrap">';
		if(thisVersion || note.prerelease) html +=	'<div class="releaseVer" style="margin-top:35px;">';
		else html +=								'<div class="releaseVer">';
		html +=			note.version;
		html +=			'<br/>';
		html +=			'<div class="release_date">' + note.date + '</div>';
		html +=		'</div>';

		html +=		'<div class="releaseNotes">';
		if(note.prerelease) html += '<div class="prerelease"> ' + lang.prerelease +' </div>';
		if(thisVersion)     html +=	'<div class="selectRelease"> ' + lang.your_network_msg +' </div>';
		html +=			'<div class="releaseHeader"> ' + lang.hyperledger_commit_level +': </div>';
		html +=			'<p><a href="' + note.commit + '" target="_blank">' + note.commit.substring(pos) + '</a></p>';
		html +=			'<div class="releaseHeader"> ' + lang.new_features + ': </div>';
		for(var x in note.new_features)    html +=	'<p> - ' + note.new_features[x] + '</p>';
		if(note.new_features.length === 0) html +=	'<p> - ' + lang.nothing + '</p>';
		html +=			'<div class="releaseHeader"> ' + lang.fixes + ': </div>';
		for(x in note.fixes)    	html +=	'<p> - ' + note.fixes[x] + '</p>';
		if(note.fixes.length === 0) html +=	'<p> - ' + lang.nothing + '</p>';
		html +=			'<div class="releaseHeader">' + lang.known_issues + ': </div>';
		for(x in note.known_issues)    		html +=	'<p> - ' + note.known_issues[x] + '</p>';
		if(note.known_issues.length === 0) 	html +=	'<p> - ' + lang.nothing + '</p>';
		html +=		'</div>';

		html +=	'</div>';
	}
	$('#releaseNotesWrap').html('').append(html);
}


function activate_support_tab(){
	$('#support_content').fadeIn(200);
}

function deactivate_support_tab(){
	$('#support_content').hide();
}





$(document).on('ready', function() {

	});



$(document).on('ready', function() {
	$(document).on('click', '.bx--modal__close--icon', function() {
		if(reset_status_interval === null) hideGenericPopup(true);	
		else{
			$('#popupBody p').css('font-weight', 'bold');
			setTimeout(function(){
				$('#popupBody p').css('font-weight', 'normal');
			}, 600);
		}
	});

	$('#openTipsLink').click(function(){							
		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'<svg class="tipIcon">';
		html +=				'<use xlink:href="/img/icons/sprite.svg#common--help"></use>';
		html +=			'</svg>';
		html +=			lang.tips;
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="tipWrapper" video="1">';
		html +=			'<div class="leftTip">';
		html +=				'<div class="tipHeadline">' + lang.dashboard + '</div>';
		html +=				'<div class="tipDescription">' + lang.dashboard_description + '</div>';
		html +=			'</div>';
		html +=			'<div class="rightTip">';
		html +=				'<img class="videoWrap" src="/img/video_thumbnail.png">';
		html +=			'</div>';
		html +=		'</div>';
		html +=		'<div class="tipWrapper" video="2">';
		html +=			'<div class="leftTip">';
		html +=				'<div class="tipHeadline">' + lang.intro_to_chaincode + '</div>';
		html +=				'<div class="tipDescription">' + lang.intro_description + '</div>';
		html +=			'</div>';
		html +=			'<div class="rightTip">';
		html +=				'<img class="videoWrap" src="/img/video_thumbnail.png">';
		html +=			'</div>';
		html +=		'</div>';
		html +=		'<div class="tipWrapper" video="3">';
		html +=			'<div class="leftTip">';
		html +=				'<div class="tipHeadline">' + lang.network_operations + '</div>';
		html +=				'<div class="tipDescription">' + lang.network_description + '</div>';
		html +=			'</div>';
		html +=			'<div class="rightTip">';
		html +=				'<img class="videoWrap" src="/img/video_thumbnail.png">';
		html +=			'</div>';
		html +=		'</div>';
		html +=		'<br/>';
		html +=	'</div>';
		$('#passive-modal-innter').html(html);
		$('#passive-modal').show();
		$('#modalScreen').fadeIn();
		return false;
	});


	function build_video_tip(video){
		video = Number(video);
		var next = video + 1;
		var prev = video - 1;
		var nextCss = '';
		var prevCss = '';
		if(prev < 1){
			prev = 1;
			prevCss = 'disabledArrow';
		}
		if(next > 3) {
			next = 3;
			nextCss = 'disabledArrow';
		}
		console.log('loading video', video, next, prev);

		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'<svg class="tipIcon">';
		html +=				'<use xlink:href="/img/icons/sprite.svg#common--help"></use>';
		html +=			'</svg>';
		html +=			lang.tips;
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';

		if(video === 1) html += '<embed width="600" height="323" src="http://www.youtube.com/embed/oJ_BvRIVriU" style="margin-left:-15px;">';
		else if(video === 2) html += '<embed width="600" height="323" src="http://www.youtube.com/embed/J---aiyznGQ" style="margin-left:-15px;">';
		else if(video === 3) html += '<embed width="600" height="323" src="http://www.youtube.com/embed/dQw4w9WgXcQ" style="margin-left:-15px;">';

		html +=		'<div class="bottomTip">';

		if(video === 1){
			html +=			'<div class="tipHeadline">' + lang.dashboard +'</div>';
			html +=			'<div class="tipDescription">' + lang.dashboard_description + '</div>';
		}
		else if(video === 2){
			html +=			'<div class="tipHeadline">' + lang.intro_to_chaincode + '</div>';
			html +=			'<div class="tipDescription">' + lang.intro_description + '</div>';
		}
		else if(video === 3){
			html +=			'<div class="tipHeadline">' + lang.network_operations + '</div>';
			html +=			'<div class="tipDescription">' + lang.network_description +'</div>';
		}

		html +=			'<div class="videoNav">';
		html +=				'<svg class="linkArrowBack loadNextVideo ' + prevCss +'" loadVideo="' + prev +'">';
		html +=					'<use xlink:href="/img/icons/sprite.svg#common--previous"></use>';
		html +=				'</svg>';
		html +=				video + ' ' + lang._of  +' 3';
		html +=				'<svg class="linkArrow loadNextVideo ' + nextCss +'" loadVideo="' + next +'">';
		html +=					'<use xlink:href="/img/icons/sprite.svg#common--previous"></use>';
		html +=				'</svg>';
		html +=			'</div>';
		html +=			'<a class="helpLink" href="/' + lang._LANG + '/' + dash_ver + '/support/' + network_id + '">' + lang.more_help +'</a>';
		html +=		'</div>';
		html +=	'</div>';
		return html;
	}

	$(document).on('click', '.tipWrapper', function() {
		var html = build_video_tip($(this).attr('video'));
		$('#passive-modal-innter').html(html);
		$('#passive-modal').show();
		$('#modalScreen').fadeIn();
	});

	$(document).on('click', '.loadNextVideo', function() {
		if(!$(this).hasClass('disabledArrow')){
			var html = build_video_tip($(this).attr('loadVideo'));
			$('#passive-modal-innter').html(html);
			$('#passive-modal').show();
			$('#modalScreen').fadeIn();
		}
	});
});