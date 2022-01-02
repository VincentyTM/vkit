(function($){

var createObservable = $.observable;

function noop(){}

function createTrigger(){
	var trigger = createObservable();
	trigger.onChange = trigger;
	trigger.get = noop;
	var n = arguments.length;
	for(var i=0; i<n; ++i){
		arguments[i].subscribe(trigger);
	}
	return trigger;
}

$.trigger = createTrigger;

})($);
