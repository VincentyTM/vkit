(function($){

var createObservable = $.observable;

function noop(){}

function createUpdater(){
	var updater = createObservable();
	updater.onChange = updater;
	updater.get = noop;
	var n = arguments.length;
	for(var i=0; i<n; ++i){
		arguments[i].subscribe(updater);
	}
	return updater;
}

$.updater = createUpdater;

})($);
