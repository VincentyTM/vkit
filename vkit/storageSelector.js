(function($, undefined){

var useStorage = $.storage;

function createStorageSelector(storage, path){
	function get(){
		return storage.getItem(path);
	}
	
	function set(value){
		if( value === null || value === undefined ){
			storage.removeItem(path);
		}else{
			storage.setItem(path, value);
		}
	}
	
	function each(callback){
		var prefix = path + "/";
		var n = storage.length;
		for(var i=0; i<n; ++i){
			var key = storage.key(i);
			if( key.indexOf(prefix) === 0 ){
				callback(
					createStorageSelector(storage, key),
					key.substring(prefix.length)
				);
			}
		}
	}
	
	function select(key){
		return createStorageSelector(storage, path + "/" + key);
	}
	
	function createState(win){
		return useStorage(storage, path, win);
	}
	
	return {
		get: get,
		set: set,
		each: each,
		select: select,
		state: createState
	};
}

$.storageSelector = createStorageSelector;

})($);
