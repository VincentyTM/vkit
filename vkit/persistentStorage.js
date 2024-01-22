(function($) {

var getWindow = $.window;
var noop = $.noop;
var permission = $.permission;
var signal = $.signal;
var update = $.update;

function persistentStorage() {
	var nav = getWindow().navigator;
	
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
		permission: permission("persistent-storage", requestPermission, null),
		persisted: persisted.map()
	};
}

$.persistentStorage = persistentStorage;

})($);
