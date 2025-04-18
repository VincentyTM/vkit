(function($) {

var allSaved = $.allSaved;
var createInjectable = $.createInjectable;
var inject = $.inject;
var navigate = $.navigate;
var observable = $.observable;
var onNavigate = $.onNavigate;
var onDestroy = $.onDestroy;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function getSavePrompt(options) {
	var service = inject(SavePromptService);
	
	if (options) {
		service.configure(options);
	}
	
	return service.prompt;
}

var SavePromptService = createInjectable(function() {
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
			onDestroy(
				emitNavigate.subscribe(function(nav) {
					if (showIf(nav)) {
						enabled = false;
					}
				})
			);
		}
		
		if (typeof save === "function") {
			onDestroy(
				emitSave.subscribe(save)
			);
		}
		
		if (typeof discard === "function") {
			onDestroy(
				emitDiscard.subscribe(discard)
			);
		}
	}
	
	function close() {
		prompt.set(null);
	}
	
	onDestroy(
		onNavigate(function(nav) {
			if (allSaved.get()) {
				return;
			}
			
			enabled = true;
			emitNavigate(nav);
			
			function navigateAway() {
				navigate(nav.window, nav.url);
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
						navigate(nav.window, nav.url);
					},
					
					save: function() {
						prompt.set(null);
						emitSave(navigateAway);
					}
				});
			}
		})
	);
	
	return {
		configure: configure,
		prompt: readOnly(prompt)
	};
});

$.savePrompt = getSavePrompt;
$.savePromptService = SavePromptService;

})($);
