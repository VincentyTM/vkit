(function($){

var createState = $.state;
var makeThenable = $.thenable;

function createPromise(callback){
	var state = createState({pending: true});
	
	function resolve(value){
		if( state.get().pending ){
			state.set({fulfilled: true, value: value});
		}
	}
	
	function reject(error){
		if( state.get().pending ){
			state.set({rejected: true, error: error});
		}
	}
	
	callback(resolve, reject);
	
	return makeThenable(state.map());
}

$.promise = createPromise;

})($);
