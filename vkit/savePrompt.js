(function($) {

var allSaved = $.allSaved;
var inject = $.inject;
var navigate = $.navigate;
var observable = $.observable;
var onNavigate = $.onNavigate;
var onUnmount = $.onUnmount;
var signal = $.signal;
var update = $.update;

function getSavePrompt(options) {
	var service = inject(SavePromptService);
	
	if (options) {
		service.configure(options);
	}
	
	return service.prompt;
}

function SavePromptService() {
	var emitDiscard = observable();
	var emitNavigate = observable();
	var emitSave = observable();
	var prompt = signal(null);
	var enabled = false;
	
	function configure(options) {
		var discard = options.discard;
		var save = options.save;
		var showIf = options.showIf;
		
		if (typeof showIf === "function") {
			onUnmount(
				emitNavigate.subscribe(function(nav) {
					if (showIf(nav)) {
						enabled = false;
					}
				})
			);
		}
		
		if (typeof save === "function") {
			onUnmount(
				emitSave.subscribe(save)
			);
		}
		
		if (typeof discard === "function") {
			onUnmount(
				emitDiscard.subscribe(discard)
			);
		}
	}
	
	function close() {
		prompt.set(null);
	}
	
	onUnmount(
		onNavigate(function(nav) {
			if (allSaved.get()) {
				return;
			}
			
			enabled = true;
			emitNavigate(nav);
			
			function navigateAway() {
				navigate(nav.url, nav.window);
			}
			
			if (!enabled) {
				nav.prevent();
				
				prompt.set({
					canDiscard: function() {
						return emitDiscard.count() > 0;
					},
					
					canSave: function() {
						return emitSave.count() > 0;
					},
					
					close: close,
					
					discard: function() {
						prompt.set(null);
						emitDiscard();
						update();
						navigate(nav.url, nav.window);
					},
					
					save: function() {
						prompt.set(null);
						emitSave(navigateAway);
					}
				});
			}
		})
	);
	
	this.prompt = prompt.map();
	this.configure = configure;
}

$.savePrompt = getSavePrompt;
$.savePromptService = SavePromptService;

})($);
