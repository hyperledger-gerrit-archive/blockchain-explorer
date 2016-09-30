/* global $, document, window, lang*/
/* global friendly_name, rest_get_peers*/
/* exported activate_logs_tab, deactivate_logs_tab*/

// =================================================================================
// On Page Load Code
// =================================================================================
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
//---------------------------------------------------- //





// =================================================================================
// Build Peer HTML
// =================================================================================
function build_peer_buttons(peers){
	var html = '';

	//build each peer log panel
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

// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	$(document).on('click', '.peerLogButton', function(){
		var peer_id = $(this).attr('peer_id');
		window.open('/api/peer/' + peer_id + '/logs');
	});
});