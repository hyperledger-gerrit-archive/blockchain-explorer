/* global $, document, window, atob, lang, rest_get_peers, friendly_name, peer_rest_get_blockheight*/
/* global peer_rest_blockstats */
/* exported activate_blockchain_tab, deactivate_blockchain_tab*/

//globals for this tab
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
var get_last = 10;								//total # of blocks to fetch each time
var known_blocks = {};
var blockheight_interval = null;
var last = 0;									//the last block to fetch
var count = 0;									//# of blocks fetched so far
var next = 0;
var goingDown = false;

var TYPE_DEPLOY = 1;
var TYPE_INVOKE = 2;
var TYPE_QUERY = 3;								//i don't think this is in use yet 5/9/2016
var TYPE_TERMINATE = 4;							//^^ nor this one

var loadMoreRowHtml =  '<tr id="loadMore" class="blockchainTabRow">';
	loadMoreRowHtml += 		'<td colspan="5">' + lang.load_more + '</td>';
	loadMoreRowHtml +=	'</tr>';


// =================================================================================
// On Page Load Code
// =================================================================================
function activate_blockchain_tab(){
	$('#blockchain_content').fadeIn(200);
	$('#loadingSpinner').show();
	// 1. get list of peers
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

	// Periodically check on height
	start_height_interval();
}

function deactivate_blockchain_tab(){
	$('#blockchain_content').hide();
	clearInterval(blockheight_interval);
}





// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	$(document).on('click', '#loadMore', function(){
		console.log('starting at', bag.stats.oldest_blk_queried);
		last = bag.stats.oldest_blk_queried;							//start from the oldest block we know have read
		count = 0;														//reset
		$('#loadMore').remove();
		get_prev_blocks();												//gogo
		return false;
	});
	
	$(document).on('click', '.blockchainTabRow', function(){			//click block row populate its details in the table
		var height = $(this).attr('blockheight');
		if(height){
			build_block_details_row(height);
			$('.selectedBlock').removeClass('selectedBlock');
			$(this).addClass('selectedBlock');
		}
	});

	//window resize
	$(window).resize(function() {
		resizeTable();
		setTimeout(function() {										//call it with short delay, time for page to render on max/min
			resizeTable();
		}, 300);
	});
});


// =================================================================================
// Helper Fun
// =================================================================================
function start_height_interval(){
	if(bag && bag.peers && bag.peers.length > 0) rest_chainstats(cb_got_chainstats);	//only on a resume call rest_chainstats
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

// 2. get blockheight via chainstats
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
			if(next === 0) next = resp.height - get_last + 1;							//only get the last X if its the first time around
			if(next < 0) next = 0;
			
			if(bag.stats.chain_height > 0 && next > bag.stats.chain_height + 1){		//hotfix, skip if on initial page load, next is too high
				next = bag.stats.chain_height + 1;
				console.log('!fixing next block height  ', next);
			}

			rest_blockstats(next, get_blocks);
		}
		if(resp.height === 0 || next === 0) $('#loadMore').remove();	//there are no more blocks, remove more button
		if(resp.height === 0){
			$('#loadingTxt').html(lang.genesis);
			$('#loadingRow').show();
		}
	}
}

// 3. continue gettting block stats
function get_blocks(e, block){
	if(e == null){
		next++;
		if(next <= bag.chain.height){
			rest_blockstats(next, get_blocks);
		}
		else{
			$('#loadMore').remove();									//delete it if it exists... (this helps dont' touch)
			if(bag.stats.oldest_blk_queried > 1){
				$('#activityBody').append(loadMoreRowHtml);
			}
		}
	}
}

/*
//step up 1 at a time, only good for integer values
function step_up(selector, targetNumber){
	var lastNumber = Number($(selector).html());
	var jumpBy = 1;
	var left2go = targetNumber - lastNumber;

	if(left2go > 5) jumpBy = 2;
	if(left2go > 10) jumpBy = 8;
	if(left2go > 20) jumpBy = 16;
	if(left2go > 50) jumpBy = 32;
	if(left2go > 100) jumpBy = 64;
	if(left2go > 500) jumpBy = 128;
	if(left2go > 1000) jumpBy = Math.floor((left2go) * 0.8);

	var nextNumber = lastNumber + jumpBy;
	if(nextNumber <= targetNumber){
		$(selector).html(nextNumber);
		scaleText();

		setTimeout(function(){
			step_up(selector, targetNumber);
		}, 150);
	}
}
*/

//resize the block details table
function resizeTable(){
	var display = $('#blockDetailsTable').css('display');
	if(display === 'inline-block'){							//only control width if we are inline-block
		var new_width = $('.blockWrap').width() - 470;
		//console.log('new', $('.blockWrap').width(), new_width);
		$('#blockDetailsTable').css('width', new_width + 'px');
	}
}

function get_prev_blocks(){
	last--;
	count++;
	if(count < get_last){												//are we done?
		if(last > 0){
			goingDown = true;
			rest_blockstats(last, get_prev_blocks);						//keep going
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


// =================================================================================
// Block Fun
// =================================================================================
//build UI block
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
			css = 'firstBlock';													//new king
			$('.firstBlock').removeClass('firstBlock');							//dethrone the old king
		}
		
		if(block.height === 0){													//build inner div for genesis
			html += '<tr class="blockchainTabRow" blockheight="' + block.height + '">';
			html += 	'<td><div class="blockIcon ' + css + '"></td>';
			html +=		'<td class="blockTime">' + time + ' ' + lang.ago + '</td>';
			html +=		'<td>0</td>';
			html +=		'<td>Genesis</td>';
			html +=		'<td></td>';
			html +=	'</tr>';
		}
		else{																	//build inner div for regular block
			html += '<tr class="blockchainTabRow" blockheight="' + block.height + '">';
			html += 	'<td><div class="blockIcon ' + css + '"></td>';
			html +=		'<td class="blockTime">' + time + ' ' + lang.ago + '</td>';
			html +=		'<td>' + block.height + '</td>';
			html +=		'<td>' + deploys + '</td>';
			html +=		'<td>' + invokes + '</td>';
			html +=	'</tr>';
		}
	
		$('#loadingRow').hide();												//this row just says 'loading', hide it
		
		if(goingDown){
			$('#activityBody').append(html);									//add row to top (page is loading 1st time)
		}
		else{
			$('#activityBody').prepend(html);									//add row to bottom (user hit load more)
		}
		resizeTable();
	}
}

//build table row - for block details
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
		if(encrypted){																	//payload is encrypted or malformed, either way leave it
			payload = '(' + lang.encrypted + ') ' + known_blocks[height].transactions[i].payload;	//assume encrypted...
			displayccid = '(' + lang.encrypted + ') ' + known_blocks[height].transactions[i].chaincodeID;
		}
		else{
			payload = payload.substring(pos + ccid.length + 2);
		}
		if(known_blocks[height].transactions[i].type == TYPE_DEPLOY) {					//if its a deploy, switch uuid and ccid for some unkown reason
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

//convert type to transactions name
function type2word(type){
	if(type === TYPE_DEPLOY) return lang.deploy;											//type is numeric
	if(type === TYPE_INVOKE) return lang.invoke;
	if(type === TYPE_QUERY) return lang.query;
	if(type === TYPE_TERMINATE) return lang.terminate;
	return type;
}

//record statistics
function add2stats(block){
	if(block && block.height && block.transactions){
		bag.stats.session_blk_count++;
		if(block.height > bag.stats.chain_height) bag.stats.chain_height = block.height;
		if(block.height < bag.stats.oldest_blk_queried) bag.stats.oldest_blk_queried = block.height;//older blocks have smaller block heights
		
		for(var i in block.transactions){
			if(block.transactions[i].type === TYPE_DEPLOY) bag.stats.deploys++;
			if(block.transactions[i].type === TYPE_INVOKE) bag.stats.invokes++;
		}
		
		var total_count = 0;
		var firstBlockTimestamp = Date.now() / 1000;
		var lastBlockTimstamp = 0;
		for(i in known_blocks){														//count blocks in the last hour
			if(known_blocks[i].nonHashData && known_blocks[i].nonHashData.localLedgerCommitTimestamp) {
				//console.log('block time is', known_blocks[i].nonHashData.localLedgerCommitTimestamp.seconds);
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
		//console.log('!', lastBlockTimstamp, firstBlockTimestamp, elasped_hour, total_count, rate);
		
		$('#blockHeight').html(Number(bag.stats.chain_height) + 1);
		$('#blockDeploys').html(bag.stats.deploys);
		$('#blockInvokes').html(bag.stats.invokes);
		$('#blockRate').html(rate.toFixed(1));
		$('#blockTrans').html( ((bag.stats.deploys + bag.stats.invokes) / bag.stats.session_blk_count).toFixed(1) );
		$('.sessionBlocks').html(Number(bag.stats.session_blk_count) + 1);
		
		//scale font sizes to fit, this is a bit hard coded so if you change the text adjust this again
		scaleText();
	}
}

//scale font sizes to fit, this is a bit hard coded so if you change the text adjust this again
function scaleText(){
	var fontSize = 40;
	for(fontSize = 40; $('#blockHeight').width() > 90; --fontSize) $('#blockHeight').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockDeploys').width() > 40; --fontSize) $('#blockDeploys').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockInvokes').width() > 40; --fontSize) $('#blockInvokes').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockRate').width() > 90; --fontSize) $('#blockRate').css('font-size', fontSize + 'px');
	for(fontSize = 40; $('#blockTrans').width() > 80; --fontSize) $('#blockTrans').css('font-size', fontSize + 'px');
}


// =================================================================================
// REST fun
// =================================================================================
//rest call to peer to get chain stats
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

//rest call to peer to get stats for a block
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
				known_blocks[block.height] = block;									//remember the block
				add2stats(block);
				build_chain_row(block);													//draw the block
			}
			else{
				known_blocks[block.height] = block;									//remember the block
			}
			
			if(cb) cb(null, block);
		}
	});
}


// =================================================================================
// Other fun
// =================================================================================
//display seconds
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

//fancy date
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
			if(tmp >= 12) return lang.time_pm;
			return lang.time_am;
		case 'P':								//AM / PM
			tmp = date.getUTCHours();
			if(tmp >= 12) return lang.time_pm.toUpperCase();
			return  lang.time_am.toUpperCase();
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
