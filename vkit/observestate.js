(function($, undefined){

var unmount = $.unmount;
var onChange = $.onChange;
var createState = $.state;

function observeState(state, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return observeState(state, prop);
			}
		});
	}
	var value = createState(undefined);
	var unsub;
	var _set = value.set;
	value.set = function(v){
		var obj = state.get();
		if( obj ){
			_set(obj[prop] = v);
		}
	};
	state.effect(function(obj){
		unsub && unsub();
		if( obj ){
			unsub = onChange(obj, prop).subscribe(function(v){
				_set(v);
			});
			_set(obj[prop]);
		}else{
			_set(undefined);
		}
	});
	unmount(function(){
		unsub && unsub();
	});
	return value;
}

$.observeState = observeState;

})($);
