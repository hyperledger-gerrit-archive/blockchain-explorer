/* global $, document, hideGenericPopup, dash_ver, network_id, reset_status_interval, lang*/

// =================================================================================
// On Load
// =================================================================================
$(document).on('ready', function() {
	//close generic popup panel
	$(document).on('click', '.bx--modal__close--icon', function() {
		if(reset_status_interval === null) hideGenericPopup(true);	//don't close if reset is happening
		else{
			$('#popupBody p').css('font-weight', 'bold');
			setTimeout(function(){
				$('#popupBody p').css('font-weight', 'normal');
			}, 600);
		}
	});

	//open tips section
	$('#openTipsLink').click(function(){							//open first use panel
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

	// =================================================================================
	// jQuery UI Events
	// =================================================================================

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

	//show video list
	$(document).on('click', '.tipWrapper', function() {
		var html = build_video_tip($(this).attr('video'));
		$('#passive-modal-innter').html(html);
		$('#passive-modal').show();
		$('#modalScreen').fadeIn();
	});

	//show video player
	$(document).on('click', '.loadNextVideo', function() {
		if(!$(this).hasClass('disabledArrow')){
			var html = build_video_tip($(this).attr('loadVideo'));
			$('#passive-modal-innter').html(html);
			$('#passive-modal').show();
			$('#modalScreen').fadeIn();
		}
	});
});