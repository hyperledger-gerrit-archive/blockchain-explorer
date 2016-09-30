// =================================================================================
// yeti_setup.js - JS on load code for stand alone yeti ui
// =================================================================================
/*global $, document, lang*/
/*global peer_rest_get_peers, peer_rest_post_registrar, peer_rest_get_registrar, net_doc*/
var nxt_peer_num = 0;
var selected_peer = 0;
var checking = 0;
var network_obj = {};

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
	if(net_doc) $('#setupOptionsWrap').hide();

	//show the setup options
	$('#doitagain').click(function(){
		$('#setupOptionsWrap').fadeIn();
		$('#alreadySetupMsg').fadeOut();

		var firstPeer = {};
		for(var i in net_doc.peers){
			firstPeer = net_doc.peers[i];
			break;
		}
		$('input[name="quick_api_hostname"]').val(firstPeer.api_host);
		$('input[name="quick_api_port"]').val(firstPeer.api_port);
		$('input[name="quick_network_id"]').val(net_doc._id);
		return false;
	});

	//clear all inputs
	$('#clearButton').click(function(){
		$('input').val('');
		$('textarea').html('');
	});

	//walk through button
	$('#walkButton').click(function(){
		$('.walkThrough').hide();
		$('#jsonPanel').hide();
		$('#quickPanel').slideDown();
		$('#setupOptionsWrap').fadeOut();
	});

	//json dump button
	$('#jsonDumpButton').click(function(){
		$('.walkThrough').hide();
		$('#jsonPanel').slideDown();
		$('#setupOptionsWrap').fadeOut();
	});
	
	//1st next button
	$('#quickNext').click(function(){
		var tls = false;
		$('#quickStatusResults').html(lang.talking_to_peer + '...');
		if($('#quickTLSyes').hasClass('toggleButtonOn')) tls = true;
		peer_rest_get_peers($('input[name="quick_api_hostname"]').val(), $('input[name="quick_api_port"]').val(), tls, 1, function(err, data){
			//err = null;
			inputHighlight(['input[name="quick_api_hostname"]', 'input[name="quick_api_port"]'], err);
			if(err){
				console.log(err);
				$('#quickStatusResults').append('<br/>' + lang.error_reaching_peer);
			}
			else{
				$('#quickStatusResults').append('<br/>' + lang.okay + '!');
				$('#caPanel').slideDown();
				nxt_peer_num = 0;
				for(var i in data.peers){
					build_peer_config_panel(nxt_peer_num);
					var pos = data.peers[i].address.indexOf(':');												//break off port
					var host = data.peers[i].address.substring(0, pos);
					var port = data.peers[i].address.substring(pos + 1);
					
					$('input[name="setup_api_hostname_' + nxt_peer_num + '"]').val(host);						//copy peer fields
					$('input[name="setup_api_port_' + nxt_peer_num + '"]').val($('input[name="quick_api_port"]').val());
					$('input[name="setup_grpc_hostname_' + nxt_peer_num + '"]').val(host);
					$('input[name="setup_grpc_port_' + nxt_peer_num + '"]').val(port);
					nxt_peer_num++;
				}
				
				$('input[name="setup_grpc_hostname_-1"]').val($('input[name="quick_api_hostname"]').val());		//copy ca fields
				$('input[name="setup_grpc_port_-1"]').val($('input[name="quick_api_port"]').val());
			}
		});
	});
	
	//2nd next button
	$('#caNext').click(function(){
		$(this).fadeOut();
		$('#setupPanel').slideDown();
	});
	
	//style the yes no toggle buttons
	toggleButton('#quickTLSyes', '#quickTLSno');
	toggleButton('#caYes', '#caNo');

	//add a new peer to the the end
	$('#addNewPeer').click(function(){
		build_peer_config_panel(nxt_peer_num++);
	});

	//select a peer
	$(document).on('click', '.setupSelBox', function(){
		selected_peer = $(this).attr('number');
		if(!isNaN(selected_peer)){
			if(selected_peer > -1) $('.registerPanel').slideDown();
			else $('.registerPanel').hide();
			$('.setupWrap').hide();
			$('#setup_' + selected_peer).show();
			$('.setupName').html($(this).find('.name').html());

			if(selected_peer > 0) $('#copyFromLeft').html(lang.copy + ' VP' + (selected_peer - 1)).attr('number', selected_peer).fadeIn();
			else $('#copyFromLeft').hide();
			if(Number(selected_peer) === -1) $('#testPeer').hide();
			else $('#testPeer').fadeIn();
		}
	});
	
	//remove the selected peer setup panel
	$('#removeSetupPanel').click(function(){
		var number = $('.setupWrap:visible').attr('number');
		var total_peers = nxt_peer_num - 1;
		for(; number < total_peers; number++) copyFields('right', number);
		
		$('.setupWrap[number="' + total_peers + '"]').remove();
		$('.setupSelBox[number="' + total_peers + '"]').remove();
		nxt_peer_num--;
		if(nxt_peer_num <= 0) nxt_peer_num = 0;
	});
	
	//copy the input fields from the previouse peer
	$('#copyFromLeft').click(function(){
		var num = $(this).attr('number');
		if(!isNaN(num)) copyFields('left', num);
	});
	
	//test the select peer input fields
	$('#testPeer').click(function(){
		$('#setupStatusResults').html(lang.talking_to_peer + ' ' + selected_peer + '...');
		var tls = false;
		if($('#setup_tls_yes_' + selected_peer).hasClass('toggleButtonOn')) tls = true;
		var host = $('input[name="setup_api_hostname_' + selected_peer + '"]').val();
		var port = $('input[name="setup_api_port_' + selected_peer + '"]').val();

		// ---- check peer setup ---- //
		peer_rest_get_peers(host, port, tls, selected_peer, function(err, data){
			inputHighlight(['input[name="setup_api_hostname_' + selected_peer + '"]', 'input[name="setup_api_port_' + selected_peer + '"]'], err);
			toggleStatusIcon(selected_peer, err);
			if(err){
				console.log(err);
				$('#setupStatusResults').append('<br/>' + lang.error_reaching_peer);
			}
			else{
				$('#setupStatusResults').append('<br/>Okay!');

				// ---- check enroll id ---- //
				var ids = parseEnrollIDField(selected_peer);
				if(ids.length === 0 && selected_peer === 0){									//if its the first peer, must have enrollID
					inputHighlight(['input[name="setup_enrollID_' + selected_peer + '"]'], true);
					toggleStatusIcon(selected_peer, true);
					$('#setupStatusResults').append('<br/>' + lang.register_error1 + ' ' + selected_peer);
				}
				else if(ids.length > 0){														//if ids are present check them
					$('#setupStatusResults').append('<br/>Checking enrollID ' + ids[0] + '...');
					peer_rest_get_registrar(host, port, tls, ids[0], function(err, data){
						inputHighlight(['input[name="setup_enrollID_' + selected_peer + '"]'], err);
						toggleStatusIcon(selected_peer, err);
						if(err){
							console.log(err);
							$('#setupStatusResults').append('<br/>' + lang.register_error2);
						}
						else{
							$('#setupStatusResults').append('<br/>' + lang.enrollid + ' ' + lang.okay + '!');
						}
					});
				}
				else{																			//else no ids, no problem
					inputHighlight(['input[name="setup_enrollID_' + selected_peer + '"]'], err);
					toggleStatusIcon(selected_peer, null);
				}
			}
		});
	});
	
	//setup panel next button
	$('#setupNext').click(function(){
		checking = 0;
		$('#setupStatusResults').html(lang.checking_peers);
		for(var i=0; i < nxt_peer_num; i++){
			$('#setupStatusResults').append('<br/>Talking to peer ' + i + '...');
			var host = $('input[name="setup_api_hostname_' + i + '"]').val();
			var port = $('input[name="setup_api_port_' + i + '"]').val();
			var tls = false;
			if($('#setup_tls_yes_' + i).hasClass('toggleButtonOn')) tls = true;

			// ---- check peer setup ---- //
			peer_rest_get_peers(host, port, tls, i, function(err, data){
				inputHighlight(['input[name="setup_api_hostname_' + data.shortname + '"]', 'input[name="setup_api_port_' + data.shortname + '"]'], err);
				if(err){
					console.log(err);
					$('#setupStatusResults').append('<br/>' + lang.error_reaching_peer +' ' + data.shortname);
				}
				else{
					checking++;
					$('#setupStatusResults').append('<br/>' + lang.okay +'! ' + lang.peer + ' ' + data.shortname);

					// ---- check enroll id ---- //
					var ids = parseEnrollIDField(data.shortname);
					if(ids.length === 0 && data.shortname === 0){										//if its the first peer, must have enrollID
						inputHighlight(['input[name="setup_enrollID_' + data.shortname + '"]'], true);
						toggleStatusIcon(data.shortname, true);
						$('#setupStatusResults').append('<br/>' + lang.register_error1 + ' ' + data.shortname);
					}
					else if(ids.length > 0){															//if ids are present check them
						var host = $('input[name="setup_api_hostname_' + data.shortname + '"]').val();
						var port = $('input[name="setup_api_port_' + data.shortname + '"]').val();
						var tls = false;
						if($('#setup_tls_yes_' + data.shortname).hasClass('toggleButtonOn')) tls = true;
						$('#setupStatusResults').append('<br/>Checking enrollID ' + ids[0] + '...');
						peer_rest_get_registrar(host, port, tls, ids[0], function(err, data){
							inputHighlight(['input[name="setup_enrollID_' + data.shortname + '"]'], err);
							toggleStatusIcon(data.shortname, err);
							if(err){
								console.log(err);
								$('#setupStatusResults').append('<br/>' + lang.register_error2);
							}
							else{
								$('#setupStatusResults').append('<br/>' + lang.enrollid + ' ' + lang.okay + '!');
								checking_complete();
							}
						});
					}
					else{																				//else no ids, no problem
						toggleStatusIcon(data.shortname, null);
						checking_complete();
					}
				}
			});
		}
	});

	//basic auth panel next button
	$('#basicNext').click(function(){
		var username = $('input[name="basic_username"]').val();
		var password = $('input[name="basic_password"]').val();
		var confirm = $('input[name="basic_confirm"]').val();
		var err = false;
		
		if(username) username = username.trim();
		if(password) password = password.trim();
		
		if(username !== ''){
			if(password !== confirm){
				err = true;
			}
			else if(password === ''){
				err = true;
			}
		}
		inputHighlight(['input[name="basic_password"]', 'input[name="basic_confirm"]'], err);

		if(!err){
			$(this).addClass('saveButton').html(lang.save);
			build_network_doc();
			$('#jsonDump').html(JSON.stringify(network_obj, null, 4));
			$('#jsonPanel').slideDown();
		}
	});

	//auto populate our network IDs - probably useless
	$('input[name="quick_api_hostname"]').keyup(function(){
		var host = $(this).val();
		var pos = host.indexOf('_vp');
		if(pos >= 0) $('input[name="quick_network_id"]').val(host.substring(0, pos));
	});

	//CA does it exist or not
	$('.caExists').click(function(){
		if($('#caYes').hasClass('toggleButtonOn')){
			$('#setup_-1').show();
			$('.setupSelBox[number="-1"]').show();
		}
		else{
			$('#setup_-1').hide();
			$('.setupSelBox[number=-1]').hide();
		}
	});

	//send json dump to API
	$('#jsonDumpNext').click(function(){
		try{
			network_obj = JSON.parse($('#jsonDump').html());
			inputHighlight(['#jsonDump'], null);
			return true;
		}
		catch(e){
			inputHighlight(['#jsonDump'], e);
			return false;
		}
	});

	//register a user name to a peer
	$('#registerEnrollID').click(function(){
		var id = $('input[name="setup_enrollID"]').val();
		var secret = $('input[name="setup_enrollSecret"]').val();
		var host = $('input[name="setup_api_hostname_' + selected_peer + '"]').val();
		var port = $('input[name="setup_api_port_' + selected_peer + '"]').val();
		var tls = false;
		if($('#setup_tls_yes_' + selected_peer).hasClass('toggleButtonOn')) tls = true;

		$('input[name="setup_enrollID_' + selected_peer + ']').val('test');

		$('#setupStatusResults').html(lang.talking_to_peer + ' ' + selected_peer + '...');
		peer_rest_post_registrar(host, port, true, id, secret, function(err, resp){
			inputHighlight(['input[name="setup_enrollSecret"]', 'input[name="setup_enrollID"]'], err);
			toggleStatusIcon(selected_peer, err);
			if(err){
				$('#setupStatusResults').append('<br/>' + lang.register_error3);
			}
			else{
				var append = $('input[name="setup_enrollID_' + selected_peer + '"]').val() + ',' + id;
				$('#setupStatusResults').append('<br/>' + lang.done + '!');
				$('input[name="setup_enrollID_' + selected_peer + '"]').val(append);			 //append
				$('input[name="setup_enrollID"]').val('');										//clear the field
				$('input[name="setup_enrollSecret"]').val('');
			}
		});
	});
});


// =================================================================================
// Helper Functions 
// =================================================================================

//see if the setup is done checking each peer
function checking_complete(){
	if(checking >= nxt_peer_num - 1){
		$('#setupNext').addClass('saveButton').html(lang.resave);
		build_network_doc();
		$('#jsonDump').html(JSON.stringify(network_obj, null, 4));
		$('#sessionPanel').slideDown();
	}
	else{
		console.log('not done checking, need', checking, 'on', nxt_peer_num);
	}
}

function inputHighlight(selectors, error){
	for(var i in selectors){
		if(error) $(selectors[i]).addClass('inputError');
		else $(selectors[i]).removeClass('inputError');
	}
}


//toggle the style of yes/no button pairs 
function toggleButton(id1, id2){
	$(id1).click(function(){
		$(this).removeClass('toggleButtonOff').addClass('toggleButtonOn');
		$(id2).removeClass('toggleButtonOn').addClass('toggleButtonOff');
	});
	
	$(id2).click(function(){
		$(this).removeClass('toggleButtonOff').addClass('toggleButtonOn');
		$(id1).removeClass('toggleButtonOn').addClass('toggleButtonOff');
	});
}

//build html for peer setup sub panel
function build_peer_config_panel(number){
	var required = '<span class="setupRequired">*</span>';
	var spacer = '<span class="setupRequired">&nbsp;</span>';
	//var copyUp = '<svg class="copyUp"><use xlink:href="/img/icons/sprite.svg#common--previous"></use></svg>';
	//var copyDown = '<svg class="copyDown""><use xlink:href="/img/icons/sprite.svg#common--previous"></use></svg>';
	var html = '';
	html = '<div class="inputWrap setupWrap" id="setup_' + number + '" number="' + number +'">';
	html += 	'<p>';
	html +=			required;
	html +=			'<span class="setupLegend"> ' + lang.http_hostname + ' </span>';
	html +=			'<input type="text" name="setup_api_hostname_' + number + '" class="doubleInput" placeholder="ex 127.0.0.1">';
	html +=		'</p>';
	
	html += 	'<p>';
	html +=			required;
	html +=			'<span class="setupLegend"> ' + lang.http_port + ' </span>';
	html +=			'<input type="text" name="setup_api_port_' + number + '" class="halfInput" placeholder="ex 443">';
	html +=		'</p>';

	html += 	'<p name="setup_api_tls_' + number + '">';
	html +=			spacer;
	html +=			'<span class="setupLegend"> ' + lang.http_tls + ' </span>';
	html +=			'<button class="toggleButtonOn bx--btn" id="setup_tls_yes_' + number +'"> ' + lang.yes + ' </button>';
	html +=			'<span>&nbsp</span>';
	html +=			'<button class="toggleButtonOff bx--btn" id="setup_tls_no_' + number +'"> ' + lang.no + ' </button>';
	html +=		'</p>';
	
	html += 	'<p>';
	html +=			required;
	html +=			'<span class="setupLegend"> ' + lang.grpc_hostname + ' </span>';
	html +=			'<input type="text" name="setup_grpc_hostname_' + number + '" class="doubleInput" placeholder="ex 127.0.0.1">';
	html +=		'</p>';
			
	html += 	'<p>';
	html +=			required;
	html +=			'<span class="setupLegend"> ' + lang.grpc_lang + ' </span>';
	html +=			'<input type="text" name="setup_grpc_port_' + number + '" class="halfInput" placeholder="ex 30303">';
	html +=		'</p>';

	html += 	'<p>';
	if(number === 0) html += required;
	else html += spacer;
	html +=			'<span class="setupLegend"> ' + lang.enrollid + ' </span>';
	html +=			'<input type="text" name="setup_enrollID_' + number + '" placeholder="ex id1">';
	html +=		'</p>';

	html +=	'</div>';
	$('#setup_' + number).remove();		//remove it if exists
	$('#configWrap').append(html);
	toggleButton('#setup_tls_yes_' + number, '#setup_tls_no_' + number);
	
	var sel_html = '';
	sel_html = '<div class="setupSelBox" number="' + number +'">';
	sel_html +=		'<svg class="statusIcon" number="' + number +'">';
	sel_html +=			'<use xlink:href="/img/icons/sprite.svg#common--cancel"></use>';
	sel_html +=		'</svg>';
	sel_html +=		'<svg class="statusIconValid" number="' + number +'">';
	sel_html +=			'<use xlink:href="/img/icons/sprite.svg#common--healthy"></use>';
	sel_html +=		'</svg>';
	sel_html +=		'<span class="name"> VP' + number + ' </span>';
	sel_html +=	'</div>';
	$('.setupSelBox[number="' + number + '"]').remove();		//remove it if exists
	$('.setupSelBoxWrap').append(sel_html);
}

//copy input fields from either left or right to number
function copyFields(direction, number){
	var thingsToCopy = ['setup_api_hostname_', 'setup_api_port_', 'setup_grpc_hostname_', 'setup_grpc_port_'];
	if(number >= 0){
		for(var i in thingsToCopy){
			console.log('copying over', number, 'from', direction);
			if(direction === 'left') {
				$('input[name="' + thingsToCopy[i] + number + '"]').val($('input[name="' + thingsToCopy[i] + (number-1) + '"]').val());
			}
			if(direction === 'right'){
				$('input[name="' + thingsToCopy[i] + number + '"]').val($('input[name="' + thingsToCopy[i] + (Number(number)+1) + '"]').val());
			}
		}
	}
}

//build up the network json object
function build_network_doc(){
	var network_name = $('input[name="quick_network_id"]').val();
	network_obj = {
						_id: network_name,
						peers: {},
						instance: {},
						type: 'network',
						timestamp: Date.now(),
						swarm: {
							arch: 'x86',
							name: 'yeti',
							region: 'somewhere'
						}
					};

	// ---- CA ----- //
	if($('#caYes').hasClass('toggleButtonOn')){
		network_obj.ca = {};
		network_obj.ca[(network_name + '_ca')] = 	{
														url: $('input[name="setup_grpc_hostname_-1"]').val(),
														discovery_host: $('input[name="setup_grpc_hostname_-1"]').val(),
														discovery_port: $('input[name="setup_grpc_port_-1"]').val(),
														api_host: '-',
														api_port: '-',
														type: 'ca',
														network_id: network_name,
														container_id: '',
														users: {}
													};
	}

	// ---- Peers ----- //
	network_obj.peers = {};
	for(var i=0; i < nxt_peer_num; i++){
		var tls = false;
		if($('#setup_tls_yes_' + i).hasClass('toggleButtonOn')) tls = true;										//check tls button
		network_obj.peers[(network_name + '_vp' + i)] = {
													url: $('input[name="setup_api_hostname_' + i + '"]').val(),
													companion: {},
													discovery_host: $('input[name="setup_grpc_hostname_' + i + '"]').val(),
													discovery_port: $('input[name="setup_grpc_port_' + i + '"]').val(),
													api_host: $('input[name="setup_api_hostname_' + i + '"]').val(),
													tls: tls,
													api_port: $('input[name="setup_api_port_' + i + '"]').val(),
													api_port_tls: $('input[name="setup_api_port_' + i + '"]').val(),//set it the same, this field is legacy
													type: 'peer',
													network_id: network_name,
													container_id: '',
													security: 	{
																	enabled: true,
																	enrollId: '',
																	enrollSecret: '',					//can i delete these or not?
																	eca_paddr: '',
																	tca_paddr: '',
																	tlsca_paddr: ''
																},
													users: false
												};
		network_obj.peers[(network_name + '_vp' + i)].users = parseEnrollIDField(i);
	}

	// ---- Auth ---- //
	network_obj.auth = false;
	var username = $('input[name="basic_username"]').val();
	var password = $('input[name="basic_password"]').val();
	
	if(username) username = username.trim();
	if(password) password = password.trim();
	if(username !== ''){
		network_obj.auth = {username: username, password: password};		//to do - hash this
	}
}

//split the comma seperate enrollIDs and process it into array
function parseEnrollIDField(i){
	var enrollIds = [];
	var ids = $('input[name="setup_enrollID_' + i + '"]').val();
	if(ids && ids.split){
		enrollIds = ids.split(',');
		for(var x in enrollIds){
			if(enrollIds[x].trim() === '') enrollIds.splice(x, 1);
		}
	}
	return enrollIds;
}

function toggleStatusIcon(peer_id, err){
	console.log('got', peer_id, err);
	if(err == null){
		$('svg.statusIcon[number="' + peer_id +'"]').hide();			//hide invalid
		$('svg.statusIconValid[number="' + peer_id +'"]').show();		//show valid
	}
	else{
		$('svg.statusIcon[number="' + peer_id +'"]').show();
		$('svg.statusIconValid[number="' + peer_id +'"]').hide();
	}
}