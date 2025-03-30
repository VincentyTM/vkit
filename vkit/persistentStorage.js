(function($) {

var computed = $.computed;
var getWindow = $.getWindow;
var noop = $.noop;
var permission = $.permission;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function persistentStorage() {
	var win = getWindow();
	
	if (!win) {
		return {
			permission: computed(function() {
				return {
					state: "default"
				};
			}),
			
			persisted: computed(function() {
				return false;
			})
		};
	}
	
	var nav = win.navigator;
	
	function requestPermission(grant, deny) {
		if (isSupported) {
			nav.storage.persist().then(function(value) {
				value ? grant() : deny();
				persisted.set(value);
				update();
			}, function() {
				deny();
				update();
			});
		}
	}
	
	var isSupported = nav.storage && typeof nav.storage.persist === "function";
	var persisted = signal(false);
	
	if (isSupported && typeof nav.storage.persisted === "function") {
		nav.storage.persisted().then(function(p) {
			persisted.set(p);
			update();
		}, noop);
	}
	
	return {
		permission: permission("persistent-storage", requestPermission),
		persisted: readOnly(persisted)
	};
}

$.persistentStorage = persistentStorage;

})($);
