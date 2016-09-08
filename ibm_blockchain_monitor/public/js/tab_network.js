/* global $, document, window, alert, appendPeerTable, appendChaincodeTable, convertTimeToSeconds, convertSecondsToTime, navigator, show_status */
/* global rest_get_chaincode, rest_get_peers, peer_rest_get_blockheight, build_status, friendly_name, GOOD_STATUS, CANT_GET_STATUS, rest_get_reset_status*/
/* global rest_reset_network, BAD_STATUS, MEH_STATUS, rest_get_ca, parse_4_peer_shortname, resize_peer_names, reset_status_interval:true*/
/* global hideGenericPopup, pause_refresh:true, rest_start_peer, peer_rest_get_peers*/
/* exported activate_network_tab, deactivate_network_tab*/

//globals for this tab
var check_if_refresh_interval = null;
var known_peers = {};							//track peer statuses, helps detect a change in status to build a notification


// =================================================================================
// On Page Load Code
// =================================================================================
function activate_network_tab(){
	$('#network_content').fadeIn(200);
	$('#refreshWrap').show();
	updateStats();
	start_check_refresh_interval();								//start the page refresh checker
}

function deactivate_network_tab(){
	$('#network_content').hide();
	$('#refreshWrap').hide();
	clearInterval(check_if_refresh_interval);
}





// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	// ---- Auto Refresh ---- //
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
			//console.log('Inserting Rule');
			sheet.insertRule(selector + '{' + propText + '}', sheet.cssRules.length);
		};
	})(document.createElement('style'));
	
	//auto refresh slider
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
	
	//static logs link
	$(document).on('click', '.logs', function() {
		var addr = '/api/peer/' + $(this).attr('peer_id') + '/chaincode/' + $(this).attr('cc_id') + '/logs';
		console.log('addr', addr);
		var win = window.open(addr, '_blank');
		if(win){											//browser has allowed it to be opened
			win.focus();
		}
		else{												//broswer has blocked it
			alert('Please allow popups for this site');
		}
	});
	
	//restart peer button - show warning panel
	/* removed - 8/31, dsh
	$(document).on('click', '.restart_peer', function() {
		pause_refresh = true;
		if($(this).hasClass('disabledButton')) return false;
		var peer_name = $(this).parent().parent().attr('peer');
		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'<svg class="notifcationWarning modal-icon">';
		html +=				'<use xlink:href="/img/icons/sprite.svg#common--warning"></use>';
		html +=			'</svg>';
		html +=			'Restart Warning';
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody">';
		html += 		'<p>Are you sure you want to restart <span class="highlightName">' + peer_name + '</span>?</p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary" type="button" data-modal-close=""> Cancel </button>';
		html +=		'<button id="confirmedRestart" class="bx--btn" type="button" data-modal-close="" peer="' + peer_name + '"> Yes </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});
	*/

	//restart peer button - confirmed
	/*removed - 8/31, dsh
	$(document).on('click', '#confirmedRestart', function() {
		hideGenericPopup(true);
		var peer_name = $(this).attr('peer');
		$('#loadingSpinner').show();
		pause_refresh = true;

		rest_restart_peer(peer_name, function(e, resp){
			if(e != null){
				setTimeout(function(){updateStats();}, 2000);
			}
			else{
				var secs = 75;
				process_status(peer_name, MEH_STATUS, secs);
				setTimeout(function(){updateStats();}, (secs - 5) * 1000);									//decrement it a little, give it time for response
			}
		});
	});
	*/


	//start peer button - show warning panel
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
		html +=			'Start';
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody">';
		html += 		'<p>Are you sure you want to start <span class="highlightName">' + peer_name + '</span>?</p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary" type="button" data-modal-close=""> Cancel </button>';
		html +=		'<button id="confirmedStart" class="bx--btn" type="button" data-modal-close="" peer="' + peer_name + '"> Yes </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});

	//start peer button - confirmed
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
				setTimeout(function(){updateStats();}, (secs - 5) * 1000);									//decrement it a little, give it time for response
			}
		});
	});

	//stop peer button - show warning panel
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
		html +=			'Stop Warning';
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody">';
		html += 		'<p>Are you sure you want to stop <span class="highlightName">' + peer_name + '</span>?</p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary2" type="button" data-modal-close=""> Cancel </button>';
		html +=		'<button id="confirmedStopPeer" class="bx--btn" type="button" data-modal-close="" peer="' + peer_name + '"> Yes </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});

	//stop peer button - confirmed
	$(document).on('click', '#confirmedStopPeer', function() {
		hideGenericPopup(true);
		var peer_name = $(this).attr('peer');
		var url = '/api/peer/' + peer_name + '/stop';
		console.log('stopping peer', peer_name);
		$('#loadingSpinner').show();

		$.ajax({
			url: url,
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

	//reset network button - show warning panel
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
		html +=			'<p>All your data will be permmanently deleted if you reset the network. </p>';
		html += 		'<p>Are you sure you want to reset your network? </p>';
		html +=		'</div>';
		html +=	'</div>';
		html +=	'<div class="bx--modal__buttons">';
		html +=		'<button id="closePopup" class="bx--btn--secondary2" type="button" data-modal-close=""> Cancel </button>';
		html +=		'<button id="confirmedResetNetwork" class="bx--btn" type="button" data-modal-close=""> Yes </button>';
		html +=	'</div>';
		$('#transactional-modal-innter').html(html);
		$('#transactional-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	});

	//reset network button - confirmed
	$(document).on('click', '#confirmedResetNetwork', function() {
		show_reset();														//show something right now, this will be called again too
		send_reset();
	});

	//close generic popup panel
	$(document).on('click', '#closePopup', function() {
		hideGenericPopup(true);
	});

	//show auto refresh bar
	$(document).on('mouseover', '#refreshPanel', function() {
		$('#reBar').fadeIn();
	});
	
	//hide auto refresh bar
	$(document).on('mouseleave', '#refreshPanel', function() {
		$('#reBar').fadeOut();
	});
	
	//show correct status for selected peer
	$(document).on('change', '.ccPeerSelect', function() {
		show_status(this);
	});

	//window resize
	$(window).resize(function() {
		resize_peer_names();
		resize_cc_ids();
		setTimeout(function() {								//call it with short delay, time for page to render on max/min
			resize_peer_names();
			resize_cc_ids();
		}, 300);
	});

	//show the route for the user's selection
	$(document).on('change', 'select[name="routeSelect"]', function() {
		var full = $(this).val();
		$(this).parent().find('.routeWrap').find('.routeTxt').html(full).attr('full', full);
		$(this).parent().find('.routeWrap').attr('data-tooltip', full);
		$(this).parent().find('.copyButton').attr('data-clipboard-text', full);
		resize_peer_names();
	});

	//close peer notification
	$(document).on('click', '.peerNotificationClose', function(){
		$(this).parent().fadeOut(300);
		var that = this;
		setTimeout(function(){$(that).parent().remove();}, 300);
	});
});



//rest get chaincode details and populate the table
function updateChaincodeTable() {
	rest_get_chaincode(function(e, chaincodes){
		$('.actualCC').remove();
		var found = false;
		for(var hash in chaincodes) {
			appendChaincodeTable(hash, chaincodes[hash]);
			found = true;
		}
		resize_cc_ids();
		setTimeout(function(){resize_cc_ids();}, 1000);	//dsh to-do fix this

		if(!found){
			var html = '<tr class="actualCC">';
			html +=			'<td>no chaincode found</td>';
			html +=			'<td></td>';
			html +=			'<td></td>';
			html +=		'</tr>';
			$('#chaincode tbody').append(html);
		}
	});
}

//rest get the peer details and populate the table
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
			html +=					'An error occurred while looking up the peers that belong to your service instance. ';
			html +=					' To work around this problem, please delete and recreate your instance of the service in Bluemix.';
			html +=				'</em>';
			html +=			'</td>';
			html +=		'</tr>';
			$('#health_data').append(html);
		}
		else{
			$('#loadingSpinner').hide();
			$('.actualPeer').remove();									//clear the table

			// ---- Resetting Network Detection ---- //
			if(resp.reset){
				console.log('reset hint', resp.reset);
				show_reset();
			}

			for(var i in resp.peers) {									//iter over containers and build table
				appendPeerTable(resp.peers[i], resp.peers.length - 1);	//subtract one for the ca
				if(!resp.reset){
					process_container(resp.peers[i], resp);				//blockheight and status done here
				}
			}
		}
	});
}

//figure out if its a ca or peer then handle it
function process_container(container, network_data){
	if(container.type === 'ca'){
		$('#discovery'+ container.id).parent().html('-');				//no disovery for ca's'
		if(network_data.swarm && network_data.swarm.name !== 'yeti'){
			// ---- Get CA's Status ---- //
			rest_get_ca(container.api_host, function(err, data){
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
			process_status(container.id, CANT_GET_STATUS, '-');	//its a yeti network, no ca status available
		}
	}

	// ---- Get Peer's' Blockheight + Status ---- //
	else{
		peer_rest_get_peers(container.api_host, container.api_port, container.tls, container.id, updateDiscoveryColumn);
		blockheight_repeat(container.api_host, container.api_port, container.tls, container.id, 1);
	}
}

//populate discovery count in peer table
function updateDiscoveryColumn(err, json){
	if(err == null){
		var tooltip = 'This peer has discovered: ';
		for(var i in json.peers){
			if(Number(i) === json.peers.length - 1) tooltip += '& ' + json.peers[i].ID.name.toUpperCase();
			else tooltip += json.peers[i].ID.name.toUpperCase() + ', ';
		}
		$('#discovery'+ json.shortname).html(json.peers.length).parent().attr('data-tooltip', tooltip);
	}
}

//get blockheight, if failure repeat x times
function blockheight_repeat(api_host, api_port, tls, id, attempt){
	peer_rest_get_blockheight(api_host, api_port, tls, id, function(err, resp){
		if(err != null){
			if(attempt <= 1){
				console.log('status - failed on', parse_4_peer_shortname(id), ', will try again!');
				return setTimeout(function(){ blockheight_repeat(api_host, api_port, tls, id, ++attempt);}, 1000);	//recursive
			}
			else process_status(resp.id, BAD_STATUS, null);														//no hope, build error status

		}
		else{
			process_status(resp.id, GOOD_STATUS, resp.height);													//all good, build good status
		}
	});
}

//disabled stop button, clear block height, set status as stopped
function process_status(peer_id, status, height){
	console.log('status -', parse_4_peer_shortname(peer_id), status, ', height:', height);

	if(status === GOOD_STATUS){
		$('tr[peer="' + peer_id + '"]').find('.blckheight').html(height);
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
		var secs = height;																					//yaya, its weird
		$('tr[peer="' + peer_id + '"]').find('.blckheight').html('-');
		$('tr[peer="' + peer_id + '"]').find('.peer_status').html(build_status(status, secs));
		$('tr[peer="' + peer_id + '"]').find('.stop_peer').addClass('disabledButton');
		$('tr[peer="' + peer_id + '"]').find('.start_peer').removeClass('disabledButton');
	}
	resize_peer_names();
	peer_notification(peer_id, status);
}

//update all stats
function updateStats() {
	console.log('updateStats() - fired');
	updateChaincodeTable();
	updatePeerTable();
}

//function handle for the resume/closing time thing
function start_check_refresh_interval(){
	check_if_refresh_interval = setInterval(updateTimerAndStats, 1000);
}

// Update timer every 1 second
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
	$('.restart_timer').each(function(){					//restart count down, decrement by 1
		var left = $(this).html();
		if(left > 0) left--;
		$(this).html(left);
	});
}


//send reset the network
function send_reset(){
	console.log('sending reset req');
	rest_reset_network(function(e, data){
		if(e != null){																		//error with reset req
			console.log('Error sending request');
			var html = '';
			html += '<div class="bx--modal-content">';
			html +=		'<h2 class="bx--modal-content__heading">';
			html +=			'Reset';
			html +=		'</h2>';
			html +=		'<svg class="bx--modal__close--icon">';
			html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
			html +=		'</svg>';
			html +=		'<div class="bx--modal-content__text" id="popupBody" style="text-align:center;">';
			html +=			'<p>There was an error submitting the reset request, please try again later</p>';
			html +=			'<div id="reset_loading_bar_wrap">';
			html +=				'<div id="reset_loading_bar" style="width: 1%;"></div>';
			html +=			'</div>';
			html +=			'<div id="reset_loading_percent">0% complete..</div>';
			html +=		'</div>';
			html +=	'</div>';
			$('#passive-modal-innter').html(html);
			show_reset({error: e});
			clearInterval(reset_status_interval);
			reset_status_interval = null;
		}
		else{
			show_reset();																	//no errors, show/update modal panel
		}
	});
}

//animate loading bar
function fill_loading_bar(barSelector, textSelector, percent, cb){
	$(barSelector).animate({width: (percent + '%')}, 2000, function(){
		
		if(percent < 100){
			$(textSelector).html(percent + '% complete..');
		}
		else{																//all done! 100%
			var html = '';
			html += '<div class="bx--modal-content">';
			html +=		'<h2 class="bx--modal-content__heading">';
			html +=			'Reset';
			html +=		'</h2>';
			html +=		'<svg class="bx--modal__close--icon">';
			html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
			html +=		'</svg>';
			html +=		'<div class="bx--modal-content__text" id="popupBody" style="text-align:center;">';
			html +=			'<p>Your network has been successfully reset!</p>';
			html +=			'<div id="reset_loading_bar_wrap">';
			html +=				'<div id="reset_loading_bar" style="width: 100%;"></div>';
			html +=			'</div>';
			html +=			'<div id="reset_loading_percent">100% complete</div>';
			html +=		'</div>';
			html +=	'</div>';
			$('#passive-modal-innter').html(html);
			$('#passive-modal').css('border-color', '#7cc7ff').fadeIn();
			$(textSelector).html(percent + '% complete');					//stop the interval, no need
			clearInterval(reset_status_interval);
			updatePeerTable();												//update peer table
			updateChaincodeTable();											//update chaincode table
			reset_status_interval = null;
			pause_refresh = false;
		}
		if(cb) cb();
	});
}

//show the reset panel
function show_reset(error){
	pause_refresh = true;
	if(!$('#reset_loading_bar_wrap').is(':visible')){						//if not open yet, make it open up
		hideGenericPopup();

		var html = '';
		html += '<div class="bx--modal-content">';
		html +=		'<h2 class="bx--modal-content__heading">';
		html +=			'Reset';
		html +=		'</h2>';
		html +=		'<svg class="bx--modal__close--icon">';
		html +=			'<use xlink:href="/img/icons/sprite.svg#common--close"></use>';
		html +=		'</svg>';
		html +=		'<div class="bx--modal-content__text" id="popupBody" style="text-align:center;">';
		html +=			'<p id="resetTxt">Your network is resetting.. this may take a few minutes.</p>';
		html +=			'<div id="reset_loading_bar_wrap">';
		html +=				'<div id="reset_loading_bar" style="width: 1%;"></div>';
		html +=			'</div>';
		html +=			'<div id="reset_loading_percent">0% complete..</div>';
		html +=			'<br/><br/>';
		html +=		'</div>';
		html +=	'</div>';
		$('#passive-modal-innter').html(html);
		$('#passive-modal').css('border-color', '#EFC100').fadeIn();
		$('#modalScreen').fadeIn();
	}

	if(reset_status_interval === null && error == null){
		start_reset_interval();
		fill_loading_bar('#reset_loading_bar', '#reset_loading_percent', 10);			//show the user something optimistic
	}
}

//function handle for the resume/closing time thing
function start_reset_interval(){
	reset_status_interval = setInterval(function(){										//set interval to req reset status
		rest_get_reset_status(handle_reset_status);
	}, 5000);
}

//parse reset status response
function handle_reset_status(e, data){
	console.log('reset status', data);
	if(e == null) {
		fill_loading_bar('#reset_loading_bar', '#reset_loading_percent', data.percent);	//complete is detected in this function

		if(data.deleted_timestamp === -1 || data.finished_timestamp === -1){ 			//errors, kill interval, start again
			var html = 	'<p>';
			html +=			'There was an issue resetting your network.';
			html +=			'If this message does not go away in 10 minutes then delete and re-create this network.';
			html +=		'</p>';
			$('#resetTxt').append(html);
			clearInterval(reset_status_interval);
			reset_status_interval = null;
			console.log('Error! - reset had an error, lets try again');
			setTimeout(function(){send_reset();}, 4000);
		}
	}
}

//resize the full cc id field
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

//figure out if we need to show a peer notification element
function peer_notification(peer_id, status){
	var found = false;
	var id = 0;
	for(id in known_peers) {										//find the correct status
		if(id === peer_id){
			found = true;
			break;
		}
	}
	if(found && known_peers[id] !== status && status != MEH_STATUS){//skip restart status, no notification for you
		build_peer_notification(status, peer_id);
	}
	known_peers[peer_id] = status;									//remember remember the new status
}

//build html for the peer notification
function build_peer_notification(status, id){
	var html = '';
	var css_id = 'np-' + Date.now();
	if(status === GOOD_STATUS){
		html += '<div id="' + css_id + '" class="notificationWrap notifcationSuccess peerNotification">';
		html +=		'<svg class="notificationImg notifcationSuccess peerNotificationFix">';
		html +=			'<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/img/icons/sprite.svg#common--healthy"></use>';
		html +=		'</svg>';
		html +=	'<div class="notificationBody">';
		html +=		'<strong>&nbsp; Success: &nbsp;</strong>';
		html +=		'<span>Your ' + friendly_name(id) + ' has started.</span>';
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
		html +=		'<strong>&nbsp; Warning: &nbsp;</strong>';
		html +=		'<span>Your ' + friendly_name(id) + ' has stopped.</span>';
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
			$(this).fadeOut().remove();									//only keep x notifications
		}
	});

	$('#' + css_id).show().animate({'opacity': 1}, 500, function(){});			//fade the new guy in
}