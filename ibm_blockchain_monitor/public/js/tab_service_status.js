/* global $, document, Circles, Chart, lang*/
/* global network_timestamp, broker_ver, rest_get_service_status, formatDate, escapeHtml, ZONE*/
/* exported activate_service_tab, deactivate_service_tab*/

//globals for this tab
var status_data = {};
var myChart;
var ts_start = 0;									//start timestamp for graph building, filters data on date
var ts_stop = Date.now();							//end timestamp for graph building, filters data on date
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

// --- Setup Circle Graphs --- //
var temp = new Date();
temp.setUTCHours(0,0,0,0);
ts_start = temp.getTime();													//start timestamp for graph building, filters data on date
ts_stop = Date.now();														//end timestamp for graph building, filters data on date

Circles.create(serviceObj);
Circles.create(networkObj);
Circles.create(testingkObj);

// =================================================================================
// On Page Load Code
// =================================================================================
function activate_service_tab(){
	$('#service_content').fadeIn(200);

	// --- Parse for Environment --- //
	console.log('on env', ZONE);
	var prettyEnv = {'prod': lang.production, 'stage': lang.staging, 'dev': lang.development};
	$('#envText').html(prettyEnv[ZONE]);

	//get service status data
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





// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	//set new date range, rebuild the boxes
	$('input[name="status_range"]').change(function(){
		var range = $(this).val();
		var temp = new Date();
		console.log('selected range', range);

		// ---- Build Filter for Timestamp Range ---- //
		if(range === 'today'){
			temp.setUTCHours(0,0,0,0);
			ts_start = temp.getTime();
			ts_stop = Date.now();
		}
		else if(range === 'week'){												//7 day week (not quite 7 days, 6 days + w/e time it is today)
			temp.setUTCDate(temp.getUTCDate() - 6);
			temp.setUTCHours(0,0,0,0);
			ts_start = temp.getTime();
			ts_stop = Date.now();
		}
		else if(range === 'month'){												//calendar month
			temp.setUTCDate(1);
			ts_start = temp.getTime();
			ts_stop = Date.now();
		}
		else if(range === 'lastMonth'){											//calendar last month
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
		
		build_all_circle_graphs();												//build and style the circle graphs!
	});
});


// =================================================================================
// Helper Fun
// =================================================================================
//build all the circle graphs
function build_all_circle_graphs(){
	build_circle_graphs(serviceObj, status_data[ZONE].logs.creation);
	build_circle_graphs(networkObj, status_data[ZONE].logs.keeper);
	build_circle_graphs(testingkObj, status_data[ZONE].logs.creation.concat(status_data[ZONE].logs.keeper.concat(status_data[ZONE].logs.docker)));
}

//style watchman divs according to erro count
function build_circle_graphs(obj, logs){
	var successes = 0;
	var errors = 0;
	
	for(var i in logs){													//filter on date range
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

	// ---- Color-Code the Circle Graph ---- //
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

//format the data for a histogram line graph
function build_histogram_graph(data){
	var ctx = document.getElementById('statusChart').getContext('2d');			//grab graph element
	Chart.defaults.global.defaultFontColor = '#8c9ba5';
	var histo = [];
	var labels = [];

	for(var i in data[ZONE].logs.histo.labels){									//build the % success array
		histo.push(Math.floor(data[ZONE].logs.histo.val[i]));
		labels[i] = formatDate(data[ZONE].logs.histo.labels[i], '%H:%m');
	}
	var chart_data = 	{														//setup graph data
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

//build style the status messages from us
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

//find release note for network
function find_release_note_for_a_network(release_notes, network_broker_ver, network_timestamp){
	var note = {version: null};
	for(var i in release_notes){
		var iter_note = release_notes[i].doc;

		// --- Match Broker Version with Network --- //
		if(network_broker_ver && network_broker_ver.length > 2){		//do it based on broker ver name (prefered method)
			console.log(iter_note.version, '===', network_broker_ver);
			if(network_broker_ver === iter_note.version){
				note = release_notes[i].doc;
				break;
			}
		}
		else{															//do it based on date (fallback method)
			var ts_release = new Date(iter_note.date).getTime();
			console.log(iter_note.version, iter_note.date, '- days elasped:', (network_timestamp - ts_release)/1000/60/60/24);
			if(network_timestamp >= ts_release){
				note = release_notes[i].doc;
				break;
			}
		}
	}

	console.log('interm release note version', note.version);
	if(note.broker_upgraded){											//broker has been upgraded, need to select new version
		console.log('valid broker upgrade for network!');
		return find_release_note_for_a_network(release_notes, note.broker_upgraded, null);
	}
	else return note.version;
}

//built html for release notes
function build_release_notes(release_notes){
	var html = '';
	
	var version4network = find_release_note_for_a_network(release_notes, 'v' + broker_ver, network_timestamp);
	if(version4network) $('#statusVer').html(version4network);
	else $('#statusVer').html(status_data[ZONE].version);				//fallback
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