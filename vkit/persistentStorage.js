(function($, navigator){

var createPermissionState = $.permission;
var createState = $.state;
var render = $.render;

function noop(){}

function persistentStorage(nav){
	if(!nav){
		nav = navigator;
	}
	
	function requestPermission(grant, deny){
		if( isSupported ){
			nav.storage.persist().then(function(value){
				if( value ){
					grant();
				}else{
					deny();
				}
				persisted.set(value);
				render();
			}, function(){
				deny();
				render();
			});
		}
	}
	
	var isSupported = nav.storage && typeof nav.storage.persist === "function";
	var persisted = createState(false);
	
	if( isSupported && typeof nav.storage.persisted === "function" ){
		nav.storage.persisted().then(function(p){
			persisted.set(p);
			render();
		}, noop);
	}
	
	return {
		permission: createPermissionState("persistent-storage", requestPermission, null, nav),
		persisted: persisted.map()
	};
}

$.persistentStorage = persistentStorage;

})($, navigator);
