(function($){

var createObservable = $.observable;
var createState = $.state;
var effect = $.effect;

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
	var hasEffect = false;
	var autoUnsubscribe = false;
	
	state.unsubscribe = unsubscribe;
	
	for(var cname in map){
		var value = map[cname];
		
		if( value && typeof value.subscribe === "function" ){
			value.subscribe(updateValue);
		}else if( typeof value === "function" ){
			hasEffect = true;
		}
	}
	
	if( hasEffect ){
		effect(updateValue);
	}
	
	return state;
}

$.classNames = classNames;

})($);
