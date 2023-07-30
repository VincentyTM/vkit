(function($){

var onUnmount = $.unmount;

function createAbortSignal(){
	var abortController = new AbortController();
	
	onUnmount(function(){
		abortController.abort();
	});
	
	return abortController.signal;
}

$.abortSignal = createAbortSignal;

})($);
