// =================================================================================
// common.js - JS code to run on load all/most pages
// =================================================================================
/* global $, document, window, svg4everybody, Clipboard*/
/* global blockheight_interval, start_height_interval, check_if_refresh_interval, start_check_refresh_interval, reset_status_interval*/
/* global activate_network_tab, activate_blockchain_tab, deactivate_network_tab, deactivate_blockchain_tab, deactivate_demo_tab*/
/* global activate_demo_tab, deactivate_logs_tab, activate_logs_tab, deactivate_service_tab, activate_service_tab */
/* global activate_support_tab, deactivate_support_tab, start_reset_interval*/

//globals for all tabs
if (!window.location.origin) {							//fix ie 10 and under
	window.location.origin = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
}
svg4everybody();
var mobileNavOpen = false;
var closing_time = false;
var closing_time_timeout = Date.now() + 60 * 1000 * 1;	//don't set limit here, look lower
var checkInterval = null;
var resume = [];
var ON_PAGE = 'invalid';
var path_parts = window.location.pathname.split('/');
if(path_parts[1] === 'v2' || path_parts[1] === 'v1') ON_PAGE = path_parts[2];
else ON_PAGE = path_parts[1];
console.log('detecting user on page', ON_PAGE);
activate_page_js();
set_nav();

// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	new Clipboard('.copyButton');						//activate copy button class

	$('#closingButton').click(function(){
		$('#closingTimeWrap').fadeOut();
		$('#closingScreen').fadeOut();
		start_timer();									//star the check again
		try{
			for(var i in resume){
				resume[i]();							//run function to get it back
			}
		}
		catch(e){}
		resume = [];									//empty it out
	});

	$(document).on('click', '.notificationClose', function(){	//close notification panel
		$(this).parent().fadeOut();
	});

	$(document).on('click', '.navLink', function() {
		deactivate_page_js();
		ON_PAGE = $(this).attr('act');
		if(ON_PAGE !== 'apis'){							//this is not in our single app...
			activate_page_js();
			set_nav();

			var navStyleIsMobile = page_is_mobile();
			if(navStyleIsMobile){
				if(mobileNavOpen){
					console.log('hiding mobile nav options');
					$('.navLink').each(function(){							//hide everything but the selected one
						if(!$(this).hasClass('selectedPage')) $(this).fadeOut();
					});
					mobileNavOpen = false;
				}
			}
			return false;
		}
	});

	// =================================================================================
	// Navigation Toggle Stuff
	// =================================================================================
	$(document).on('click', '.selectedPage', function() {				//open/close mobile nav style
		var navStyleIsMobile = page_is_mobile();
	
		if(navStyleIsMobile){
			if(mobileNavOpen){
				console.log('hiding mobile nav options');
				$('.navLink').each(function(){							//hide everything but the selected one
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

	//window resize toggle between mobile and desktop nav style
	$(window).resize(function() {
		var navStyleIsMobile = page_is_mobile();
	
		if(navStyleIsMobile){
			//console.log('hiding mobile nav options');
			$('.navLink').each(function(){								//hide everything but the selected one
				if(!$(this).hasClass('selectedPage')) $(this).hide();
			});
			mobileNavOpen = false;
		}
		else{
			//console.log('showing all nav options');
			$('.navLink').show().css('display','block');
			mobileNavOpen = false;
		}
	});

	function page_is_mobile(){
		var ret = false;
		if($('.selectedPage').width() > 300) ret = true; 					//this is hokey as fuck, but it'll do
		return ret;
	}


	// =================================================================================
	// Closing Time Stuff
	// =================================================================================
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
			
			//blockchain page stuff
			try{
				if(blockheight_interval){
					clearInterval(blockheight_interval);
					resume.push(start_height_interval);
				}
			}
			catch(e){}
			
			//monitor page stuff
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
	
			//hide any open modals
			$('#transactional-modal').hide();
			$('#transactional-modal-innter').html('');
			$('#passive-modal').hide();
			$('#passive-modal-innter').html('');
			$('#modalScreen').hide();

			//show the closing time modal
			$('#closingTimeWrap').fadeIn();
			$('#closingScreen').fadeIn();
			clearInterval(checkInterval);
		}
		else{
			console.log('sec till closing time', time_left/1000);
		}
	}

	//reset closing time timer
	function reset_closing_time(){
		closing_time_timeout = Date.now() + 60 * 1000 * 7;			//closing_time_timeout in x minutes
	}
});


// =================================================================================
// Navigation Toggle Stuff - More
// =================================================================================
//activate the selected tab's js code
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

//stop the current tab's js code
function deactivate_page_js(){
	console.log('deactivating', ON_PAGE);
	if(ON_PAGE === 'network') deactivate_network_tab();
	else if(ON_PAGE === 'blockchain') deactivate_blockchain_tab();
	else if(ON_PAGE === 'demo') deactivate_demo_tab();
	else if(ON_PAGE === 'logs') deactivate_logs_tab();
	else if(ON_PAGE === 'service') deactivate_service_tab();
	else if(ON_PAGE === 'support') deactivate_support_tab();
}

//set the url link and nav class
function set_nav(){
	window.history.pushState({},'', '/' + path_parts[1] + '/' + ON_PAGE +'/' + path_parts[3]);
	$('.navLink').each(function(){										//add icon to selected tab
		var link = $(this).attr('act');
		if(ON_PAGE === link){
			var html = '<svg class="selectedNavChev">';
			html 	+= 		'<use xlink:href="/img/icons/sprite.svg#service--chevron"></use>';
			html    += '</svg>';
			$(this).addClass('selectedPage').find('.selectedNavChevron').html(html);
		}
		else $(this).removeClass('selectedPage').find('.selectedNavChevron').html('');
	});
}