(function($) {

var getWindow = $.getWindow;
var onEvent = $.onEvent;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function createInstallPrompt() {
	var win = getWindow();
	
	var isAppInstalled = !!win && (
		win.navigator.standalone ||
		(win.matchMedia && win.matchMedia("(display-mode: standalone) or (display-mode: fullscreen) or (display-mode: minimal-ui)").matches) ||
		win.document.referrer.indexOf("android-app://") > -1
	);
	
	var installPrompt = signal(null);
	var result = signal(isAppInstalled ? "installed" : "default");
	
	function beforeInstall(e) {
		e.preventDefault();
		
		installPrompt.set({
			accept: function() {
				e.prompt();
				e.userChoice.then(setChoice);
			},
			deny: deny
		});
	}
	
	function setChoice(choiceResult) {
		result.set(choiceResult.outcome);
		installPrompt.set(null);
		update();
	}
	
	function appInstalled() {
		result.set("installed");
	}
	
	function deny() {
		installPrompt.set(null);
		result.set("dismissed");
	}
	
	if (win) {
		onUnmount(onEvent(win, "beforeinstallprompt", beforeInstall));
		onUnmount(onEvent(win, "appinstalled", appInstalled));
	}
	
	var installPromptState = readOnly(installPrompt);
	installPromptState.result = readOnly(result);
	return installPromptState;
}

$.installPrompt = createInstallPrompt;

})($);
