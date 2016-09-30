/* global $, document, lang*/
/* global escapeHtml, peer_rest_post_registrar, peer_rest_get_registrar, rest_get_peers */
/* global rest_get_cc_hashses, peer_rest_deploy, peer_rest_invoke, peer_rest_query */
/* exported activate_demo_tab, deactivate_demo_tab*/

//globals for this tab
var user = null, peer = null;
var tab = '&nbsp;&nbsp;';
var cc_hashes = {};
var known_ccs = {};
var logger = {							//my dumb logging to UI function
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

// =================================================================================
// On Page Load Code
// =================================================================================
function activate_demo_tab(){
	$('#demo_content').fadeIn(200);
	$('.notificationWrap').hide();
	$('.demoLoading').fadeIn();
	rest_get_cc_hashses(function(e, resp){					//lets get known chaincode hashes
		if(e == null) known_ccs = resp;

		//get enrollID list
		rest_get_peers(function(e, data){
			if(data){
				user = data.user;
				peer = data.peers[1];						//move data around
			}
			if(user && peer) {
				check_enroll_id();							//check id for yeti
			}
		});
	});
}

function deactivate_demo_tab(){
	$('#demo_content').hide();
}

// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	$('.showActions').click(function(){
		var panel = $(this).parent().parent().find('.demoActionWrap');
		if($(panel).is(':visible')){
			$(panel).fadeOut();
			$(this).html(lang.show_actions);
		}
		else{
			$('.showActions').html(lang.show_actions);
			$('.demoActionWrap').fadeOut();									//hide others
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
		var map = 	{														//deploy settings
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
				$('.' + cc).fadeIn();							//show action panel for this demo
				$('.showActions[cc="' + cc + '"]').html(lang.hide_actions);
				$('#' + cc + 'Loading').fadeOut();
				if(data.result){
					cc_hashes[data.result.message] = true;
					build_cc_options(cc_hashes);
					$('.' + cc).fadeIn();						//show action panel for this demo
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
		enableExecuteButtons();									//decide if we can enable the exe button
	});

	//run the damn thing
	$('.executeAction').click(function(){
		var this_ex = $(this).attr('cc');
		var action = $('.selectAction[cc="' + this_ex +'"]').val();
		console.log(this_ex, 'action is', action);

		switch(action){
			// ----------------------- Example02 Options ------------------------- //
			case 'invokeA2B': invokeA2B(); break;
			case 'invokeB2A': invokeB2A(); break;
			case 'queryA': queryA(); break;
			case 'queryB': queryB(); break;

			// ----------------------- Marbles Options ------------------------- //
			case 'createMarble': createMarble(); break;
			case 'transferMarble': transferMarble(); break;
			case 'delMarble': delMarble(); break;
			case 'queryMarble': queryMarble(); break;

			// ----------------------- CP Options ------------------------- //
			case 'regAcount': regAcount(); break;
			case 'issuePaper': issuePaper(); break;
			case 'buyPaper': buyPaper(); break;
			case 'queryAccount': queryAccount(); break;
		}
	});

	// ----------------------- Example02 Options ------------------------- //
	function invokeA2B(){													//invoke button
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_invoke_peer(hash, 'invoke', ['a', 'b', '5'], user.enrollId, function(){
			show_next_step(3);
			$('#example02Loading').fadeOut();
		});
	}
	function invokeB2A(){													//invoke button
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_invoke_peer(hash, 'invoke', ['b', 'a', '5'], user.enrollId, function(){
			show_next_step(3);
			$('#example02Loading').fadeOut();
		});
	}
	function queryA(){														//query button
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_query_peer(hash, 'query', ['a'], user.enrollId, false, function(){
			show_next_step(4);
			$('#example02Loading').fadeOut();
		});
	}
	function queryB(){														//query button
		$('#example02Loading').fadeIn();
		var hash = $('select[cc="example02"]').val();
		rest_query_peer(hash, 'query', ['b'], user.enrollId, false, function(){
			show_next_step(4);
			$('#example02Loading').fadeOut();
		});
	}
	
	// ----------------------- Marbles Options ------------------------- //
	function createMarble(){												//invoke button
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_invoke_peer(hash, 'init_marble', ['demo_marble', 'blue', '35', 'bob'], user.enrollId, function(){
			show_next_step(3);
			$('#transferMarble').prop('disabled', false);
			$('#delMarble').prop('disabled', false);
			$('#marblesLoading').fadeOut();
		});
	}
	function transferMarble(){												//invoke button
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_invoke_peer(hash, 'set_user', ['demo_marble', 'leroy'], user.enrollId, function(){
			show_next_step(3);
			$('#marblesLoading').fadeOut();
		});
	}
	function delMarble(){													//invoke button
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_invoke_peer(hash, 'delete', ['demo_marble'], user.enrollId, function(){
			show_next_step(3);
			$('#marblesLoading').fadeOut();
		});
	}
	function queryMarble(){													//query button
		$('#marblesLoading').fadeIn();
		var hash = $('select[cc="marbles"]').val();
		rest_query_peer(hash, 'read', ['demo_marble'], user.enrollId, false, function(){
			show_next_step(4);
			$('#marblesLoading').fadeOut();
		});
	}
	
	// ----------------------- CP Options ------------------------- //
	function regAcount(){													//invoke button
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
	function issuePaper(){													//invoke button
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
	function buyPaper(){													//invoke button
		$('#cpLoading').fadeIn();
		var hash = $('select[cc="cp"]').val();
		
		//find all CPs first... then use the first one
		logger.log(lang.query_cp_msg);
		rest_query_peer(hash, 'query', ['GetAllCPs'], user.enrollId, false, function(e, data){
			try{
				data = JSON.parse(data.result.message);						//get all the cps
			}
			catch(e){
				console.log('cannot parse GetAllCPs response', e);
			}

			if(data && data[0] && data[0].cusip){
				var obj = 	{
					CUSIP: data[0].cusip,									//use the first one
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
	function queryAccount(){												//query button
		$('#cpLoading').fadeIn();
		var hash = $('select[cc="cp"]').val();
		rest_query_peer(hash, 'query', ['GetCompany', users_account], user.enrollId, false, function(){
			show_next_step(4);
			$('#cpLoading').fadeOut();
		});
	}
});


// =================================================================================
// REST functions
// =================================================================================
//deploy chaincode, duh
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

//format rest body
function build_rest_body(hash, type, func, args, enrollId){
	return 	{																		//build our body up
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

//invoke a peer
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

//query a peer
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

//check if enrollID has already been registered (this if for yeti)
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

//resister an enroll ID
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


// =================================================================================
// Helper Functions
// =================================================================================
//enabled deploy buttons
function rdy_for_user(){
	$('.demoLoading').fadeOut();
	$('.deployButton').prop('disabled', false);					//enable the buttons, ready for user
	enableExecuteButtons();

	for(var hash in known_ccs) {
		if(known_ccs[hash] === 'example02') test_if_example02_cc_exists(hash);
		else if(known_ccs[hash] === 'marbles') test_if_marbles_cc_exists(hash);
		else if(known_ccs[hash] === 'cp') test_if_cp_cc_exists(hash);
	}
}

//log the rest call details
function log_api_req(color, method, path, body){
	var html = 	'<div class="apiDetails" style="color:' + color +'">';
	html +=			'<div class="apiReq">HTTP ' + method.toUpperCase() + ' ' + path + '</div>';
	if(body) html +='<pre>' + JSON.stringify(body, null, 4) + ' </pre>';
	html +=		'</div>';
	$('#demoLogs').append(html);
	showOrHideDetails();
}

//log the rest call details
function log_api_resp(color, resp){
	var html = 	'<div class="apiDetails" style="color:' + color +'">';
	html +=			tab + tab + 'Response<pre>' + escapeHtml(JSON.stringify(resp, null, 4)) + ' </pre>';
	html +=		'</div>';
	$('#demoLogs').append(html);
	$('#demoLogs').append('<br/>');
	showOrHideDetails();
}

//build the drop downs for EACH cc option
function build_cc_options(hashes){
	console.log('deployed cc hashes', hashes);
	for(var y in known_ccs){										//iter over each example, build select options list for each one
		var html = '';
		//console.log('buidling', known_ccs[y]);
		for(var i in hashes){
			var nickname = '?';
			var selectMe = '';
			var disable = '';
			for(var x in known_ccs) {
				if(x === i) nickname = known_ccs[x];				//detect if this is a known cc hash
			}
			//console.log('found', nickname);
			if(nickname === '?' || nickname === known_ccs[y]){		//build option if it is unknown or is known && for this select box
				//console.log('building', nickname);
				if(selectMe === '' && nickname === known_ccs[y]) selectMe = 'selected="selected"';
				if(known_ccs[y] === 'invalid') disable = 'disabled="disabled"';
				html += '<option value="' + i + '" ' + selectMe +' ' + disable + '>' + nickname + ': ' + i.substr(0, 8) + '...</option>';
			}
		}
		
		//if no options, build invalid cc hint
		if(html === '') html = '<option disabled="disabled" selected="selected">' + lang.invalid.toLowerCase() + '</option>';
		$('.selectCC[cc="' +  known_ccs[y] +'"]').html(html);
		enableOptions(known_ccs[y]);
	}
}

//show the next guided step
var deployTimer = null, invokeTimer = null, queryTimer = null;
function show_next_step(step){
	if(step == 2){
		//$('.notificationWrap').hide();
		$('.deployHelperText').fadeIn();
		clearTimeout(deployTimer);
		deployTimer = setTimeout(function(){$('.deployHelperText').fadeOut();}, 10000);
	}
	if(step == 3){
		//$('.notificationWrap').hide();
		$('.invokeHelperText').fadeIn();
		clearTimeout(invokeTimer);
		invokeTimer = setTimeout(function(){$('.invokeHelperText').fadeOut();}, 10000);
	}
	if(step == 4){
		//$('.notificationWrap').hide();
		$('.queryHelperText').fadeIn();
		clearTimeout(queryTimer);
		queryTimer = setTimeout(function(){$('.queryHelperText').fadeOut();}, 10000);
	}
}

//show or hide the API logging details
function showOrHideDetails(){
	if($('input[name="showAPIdetails"]').is(':checked')){
		$('.apiDetails').fadeIn();
	}
	else{
		$('.apiDetails').fadeOut();
	}
	$('#demoLogs').scrollTop($('#demoLogs')[0].scrollHeight);
}

//enable query or invoke options (ONLY 1ST STEP options)
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

		//console.log('checking status', this_ex, selected_cc, selected_action);
		if(selected_cc && selected_action){
			$('.executeAction[cc="' + this_ex  +'"]').prop('disabled', false);
		}
		else $('.executeAction[cc="' + this_ex  +'"]').prop('disabled', true);
	});
}

//test if example02 cc exists by querying a known cc hash
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

//test if marbles cc exists by querying a known cc hash
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

//test if cp web cc exists by querying a known cc hash
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