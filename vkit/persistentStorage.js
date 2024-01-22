(function($) {

var createPermissionState = $.permission;
var createState = $.state;
var getWindow = $.window;
var update = $.update;

function noop(){}

function persistentStorage() {
	var nav = getWindow().navigator;
	
	function requestPermission(grant, deny){
		if( isSupported ){
			nav.storage.persist().then(function(value){
				value ? grant() : deny();
				persisted.set(value);
				update();
			}, function(){
				deny();
				update();
			});
		}
	}
	
	var isSupported = nav.storage && typeof nav.storage.persist === "function";
	var persisted = createState(false);
	
	if( isSupported && typeof nav.storage.persisted === "function" ){
		nav.storage.persisted().then(function(p){
			persisted.set(p);
			update();
		}, noop);
	}
	
	return {
		permission: createPermissionState("persistent-storage", requestPermission, null, nav),
		persisted: persisted.map()
	};
}

$.persistentStorage = persistentStorage;

})($);
