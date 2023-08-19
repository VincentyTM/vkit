(function($){

var createObservable = $.observable;

function observe(obj, prop){
	var desc = Object.getOwnPropertyDescriptor(obj, prop);
	
	if(!desc){
		return null;
	}
	
	if( desc.get && desc.get.emitChange ){
		return desc.get.emitChange;
	}
	
	var value = obj[prop];
	
	function get(){
		return value;
	}
	
	var emitChange = get.emitChange = createObservable();
	
	Object.defineProperty(obj, prop, {
		get: get,
		set: function(v){
			if( value !== v ){
				value = v;
				emitChange(v);
			}
		}
	});
	
	return emitChange;
}

$.observe = observe;

})($);
