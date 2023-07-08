(function($, window){

var createState = $.state;
var onEvent = $.onEvent;
var unmount = $.unmount;
var update = $.update;

function createInstallPrompt(win){
	if(!win){
		win = window;
	}
	
	var isAppInstalled = (
		win.navigator.standalone ||
		(win.matchMedia && win.matchMedia("(display-mode: standalone) or (display-mode: fullscreen) or (display-mode: minimal-ui)").matches) ||
		win.document.referrer.indexOf("android-app://") > -1
	);
	var installPrompt = createState(null);
	var result = createState(isAppInstalled ? "installed" : "default");
	
	function beforeInstall(e){
		e.preventDefault();
		installPrompt.set({
			accept: function(){
				e.prompt();
				e.userChoice.then(setChoice);
			},
			deny: deny
		});
		update();
	}
	
	function setChoice(choiceResult){
		result.set(choiceResult.outcome);
		installPrompt.set(null);
		update();
	}
	
	function appInstalled(){
		result.set("installed");
		update();
	}
	
	function deny(){
		installPrompt.set(null);
		result.set("dismissed");
	}
	
	unmount(onEvent(win, "beforeinstallprompt", beforeInstall));
	unmount(onEvent(win, "appinstalled", appInstalled));
	
	var installPromptState = installPrompt.map();
	installPromptState.result = result.map();
	return installPromptState;
}

$.installPrompt = createInstallPrompt;

})($, window);
