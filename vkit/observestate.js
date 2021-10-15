(function($, undefined){

$.observeState = function(state, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return $.observeState(state, prop);
			}
		});
	}
	var value = $.state(undefined);
	var unsub;
	var _set = value.set;
	value.set = function(v){
		var obj = state.get();
		if( obj ){
			_set.call(value, obj[prop] = v);
		}
	};
	state.input().effect(function(obj){
		unsub && unsub();
		if( obj ){
			unsub = $.onChange(obj, prop).subscribe(function(v){
				_set.call(value, v);
			});
			_set.call(value, obj[prop]);
		}else{
			_set.call(value, undefined);
		}
	});
	$.unmount(function(){
		unsub && unsub();
	});
	return value;
};

})($);
