/* global $, document*/
/* exported activate_support_tab, deactivate_support_tab*/

// =================================================================================
// On Page Load Code
// =================================================================================
function activate_support_tab(){
	$('#support_content').fadeIn(200);
}

function deactivate_support_tab(){
	$('#support_content').hide();
}





// =================================================================================
// jQuery UI Events
// =================================================================================
$(document).on('ready', function() {
	
});

