(function($, undefined){

var createState = $.state;
var onChange = $.onChange;
var unmount = $.unmount;

function observe(obj, prop){
	if( prop === undefined ){
		if( typeof Proxy !== "function" ){
			throw new ReferenceError("Proxy is not supported in your browser!");
		}
		return new Proxy({}, {
			get: function(target, prop, receiver){
				return observe(obj, prop);
			}
		});
	}
	var observable = onChange(obj, prop);
	if(!observable){
		throw new ReferenceError("Property '" + prop + "' does not exist!");
	}
	var state = createState(obj[prop]);
	var set = state.set;
	state.set = function(value){
		obj[prop] = value;
	};
	unmount(observable.subscribe(function(value){
		set.call(state, value);
	}));
	return state;
}

$.observe = observe;

})($);
