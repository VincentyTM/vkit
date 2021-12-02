(function($){

var unmount = $.unmount;
var addEffect = $.effect;
var createState = $.state;
var createObservable = $.observable;

function classNames(map){
	function getValue(){
		var array = [];
		for(var cname in map){
			if( get(map[cname]) ){
				array.push(cname);
			}
		}
		return array.join(" ");
	}
	function get(value){
		if( value && typeof value.get === "function" ){
			return value.get();
		}
		if( typeof value === "function" ){
			return value();
		}
		return value;
	}
	var state = createState(getValue());
	function updateValue(){
		state.set(getValue());
	}
	var unsubscribe = createObservable();
	state.unsubscribe = unsubscribe;
	var effect = false;
	var autoUnsubscribe = false;
	for(var cname in map){
		var value = map[cname];
		if( value && value.onChange && typeof value.onChange.subscribe === "function" ){
			unsubscribe.subscribe(
				value.onChange.subscribe(updateValue)
			);
			if( value.component !== state.component ){
				autoUnsubscribe = true;
			}
		}else if( typeof value === "function" ){
			effect = true;
		}
	}
	if( autoUnsubscribe ){
		unmount(unsubscribe);
	}
	if( effect ){
		addEffect(updateValue);
	}
	return state;
}

$.classNames = classNames;

})($);
