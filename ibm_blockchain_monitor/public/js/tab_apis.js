/* global $, document, window, rest_get_peers, friendly_name, network_id,  SwaggerUi, hljs*/

//globals for this tab
var swagger_url = '/rest_api_swagger.json';									//[default] - relative path to THIS file
var origUrl = '';


// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {

	window.swaggerUi = new SwaggerUi({
		url: swagger_url,
		validatorUrl: null,
		dom_id: 'swagger-ui-container',
		supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
		onComplete: function(swaggerApi, swaggerUi){
			if(window.SwaggerTranslator) {
				window.SwaggerTranslator.translate();
			}
			$('pre code').each(function(i, e) {
				hljs.highlightBlock(e);
			});
		},
		onFailure: function(data) {
			console.log('Unable to Load SwaggerUI');
		},
		docExpansion: 'none',
		apisSorter: 'alpha',
		showRequestHeaders: false
	});
	window.swaggerUi.load();
	waitForSwagger();

	rest_get_peers(function(e, resp){
		for(var i in resp.peers) {
			populate_swagger_url(resp.peers[i]);
		}
	});

	// =================================================================================
	// jQuery UI Events
	// =================================================================================
	$(document).on('change', '.peerOptionWrap', function() {
		var route = $(this).val();
		$('#urlFullPath').val(route);
		take_new_url();
	});
	
	$(document).on('click', '.enrollId, .enrollSecret', function() {
		flash_me(this);
	});
	
	$('#enrollWrapToggle').click(function(){
		if($('#enrollIDsWrap').is(':visible')){
			$('#enrollIDsWrap').slideUp();
			$('#enrollWrapStatus').html('Expand');
		}
		else{
			$('#enrollIDsWrap').slideDown();
			$('#enrollWrapStatus').html('Collapse');
		}
	});
	
	if(network_id) rest_get_creds();
	if(!network_id || network_id === 'false') {
		$('#urlFullPath').val('http://localhost:3000');						//populate swagger url if not logged in
		$('#networkId').hide();
	}

	//// Fix UI Open/Close Anchor Tag Bug ////
	$(document).on('click', '.toggleOperation', function(){					//iff open header should append that shortcut to the URL
		var item = $(this);
		setTimeout(function(){ fixURLbar(item); }, 500);					//need to delay enough for animation to finish
	});
	function fixURLbar(item){
		if($(item).parent().parent().parent().next().is(':visible')){		//if thing is visible, push the link into the URL bar
			window.history.pushState({},'', item.attr('href'));
		}
		else{																//else empty the bar
			window.history.pushState({},'', '');
		}
	}

	$('#urlFullPath').keyup(function(){
		take_new_url();
	});
	
	$('#returnUrl').click(function(){
		$('#urlFullPath').val(origUrl);
		take_new_url();
	});
});

//set the url in swagger api tab/page
function populate_swagger_url(peer){
	var route = '';
	var select = '';
	if(peer.tls === true) route = 'https://' + peer.api_host + ':' + peer.api_port;
	else route = 'http://' + peer.api_host + ':' + peer.api_port;
	
	if(peer.id.indexOf('vp0') >= 0){													//always pick vp0
		$('#urlFullPath').val(route);
		select = 'selected="selected"';
	}
	if(select === ''){
		if(peer.id.indexOf('vp1') >= 0){												//always pick vp1
			$('#urlFullPath').val(route);
			select = 'selected="selected"';
		}
	}
	
	var pos = peer.id.indexOf('vp');
	if(pos >= 0){																		//only build for peers, skip ca
		var html = '<option class="peerOption" value="' + route + '" ' + select + '>' + friendly_name(peer.id) + '</option>';
		$('.peerOptionWrap').append(html);
		$('#badPeerOption').remove();
	}
}

//get the enrollIDs and secrets for the network
function rest_get_creds(){
	$.ajax({
		method: 'GET',
		url: window.location.origin + '/api/network/' + network_id,
		contentType: 'application/json',
		success: function(json){
			console.log('Success - vcap details', json);
			build_enrollID_html(json.credentials);
		},
		error: function(e){
			console.log('Error - vcap details', e);
		}
	});
}

//build the enrollID html
function build_enrollID_html(credentials){
	var html = '<div class="enrollWrapHeader">';
	html +=			'<div class="enrollId">ID</div>';
	html +=			'<div class="enrollSecret">Secret</div>';
	html += 	'</div>';
	if(credentials.users){
		for(var i in credentials.users){
			var user = credentials.users[i];
			html += '<div class="enrollWrap">';
			html +=		'<div class="enrollId copyButton" data-clipboard-text="' + user.enrollId + '">' + user.enrollId + '</div>';
			html +=		'<div class="enrollSecret copyButton" data-clipboard-text="' + user.secret + '">' + user.secret + '</div>';
			html += '</div>';
		}
	}
	$('#enrollIDsGoHere').html(html);
}

//bold then unbold the element
function flash_me(that){
	$(that).addClass('flash');
	setTimeout(function(){
		$(that).removeClass('flash');
		$(that).removeClass('flash');
	}, 300);
}

//parse url input
function take_new_url(){
	var temp = $('#urlFullPath').val();
	$('#urlFullPath').css('width', calc_resize(temp));
	set_full_url(temp);														//set url
}
	
//wait for swagger to load AND peer data aka the peer route
function waitForSwagger(){
	if(!window.swaggerUi || !window.swaggerUi.api || !window.swaggerUi.api.host){
		console.log('swagger not fully loaded, waiting...');
		setTimeout(function(){ waitForSwagger(); }, 500);
	}
	else if($('#urlFullPath').val().indexOf('http') == -1){
		console.log('peer data not loaded, waiting...');
		setTimeout(function(){ waitForSwagger(); }, 500);
	}
	else{
		console.log('swagger is fully loaded!');
		origUrl = window.swaggerUi.api.schemes[0] + '://' + window.swaggerUi.api.host + window.swaggerUi.api.basePath;
		$('.description-link').each(function(){
			$(this).html('Model Details');											//rename
		});

		console.log(window.swaggerUi.api);
		//$('.endpoints').show();													//default to showing them all
		take_new_url();
	}
}

//parse full_url string for scheme, host, path and then set it for all swagger APIs
function set_full_url(full_url){
	var scheme = null, host = null, path = null;
	var pos1 = 0, pos2 = 0, no_scheme;
	pos1 = full_url.indexOf('://');
	if(pos1 != -1){
		no_scheme = full_url.substr(pos1 + 3);
		pos2 = no_scheme.indexOf('/');
		if(pos2 <= 0) {															//path should be near end, so pos2 should be higher
			no_scheme += '/';													//add the missing slash
			pos2 = no_scheme.indexOf('/');										//re-do
		}
		scheme = full_url.substring(0, pos1);
		host = no_scheme.substring(0, pos2);
		path = no_scheme.substring(pos2);
	}
	change_swagger_urls(scheme, host, path);
}

//calculate size of div needed for str
function calc_resize(str){
	if(!str) str = '';
	return (str.length * 7.5) + 'px';											//estimate...
}

//change scheme, host, and basepath for all swagger APIs 
function change_swagger_urls(scheme, host, basePath){
	console.log('scheme:', scheme, ', host:', host, ', basePath:', basePath);
	if(!scheme || !host || !basePath){
		return false;
	}
	for(var i in window.swaggerUi.api){
		if(window.swaggerUi.api[i] && window.swaggerUi.api[i].apis){
			for(var x in window.swaggerUi.api[i].apis){
				window.swaggerUi.api[i].apis[x].scheme = scheme;
				window.swaggerUi.api[i].apis[x].host = host;
				window.swaggerUi.api[i].apis[x].basePath = basePath;
			}
		}
	}
}