(function($){

$.onChange = function(obj, prop){
	var desc = Object.getOwnPropertyDescriptor(obj, prop);
	if(!desc){
		return null;
	}
	if( desc.get && desc.get.onChange ){
		return desc.get.onChange;
	}
	var value = obj[prop];
	function get(){
		return value;
	}
	get.onChange = $.observable();
	Object.defineProperty(obj, prop, {
		get: get,
		set: function(v){
			if( value !== v ){
				get.onChange(value = v);
			}
		}
	});
	return get.onChange;
};

})($);
