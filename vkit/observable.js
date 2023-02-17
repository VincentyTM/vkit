(function($){

function createObservable(){
	var callbacks = [], n = 0;
	
	function observable(){
		for(var i=0; i<n; i+=2){
			callbacks[i].apply(this, arguments);
		}
	}
	
	function subscribe(callback){
		function unsubscribe(){
			for(var i=Math.min(curr, n); i--;){
				if( callbacks[i] === unsubscribe ){
					callbacks.splice(i - 1, 2);
					n -= 2;
					break;
				}
			}
		}
		callbacks.push(callback, unsubscribe);
		var curr = n += 2;
		return unsubscribe;
	}
	
	function getCount(){
		return n / 2;
	}
	
	function clear(){
		if( n > 0 ){
			callbacks.splice(0, n);
			n = 0;
		}
	}
	
	observable.subscribe = subscribe;
	observable.count = getCount;
	observable.clear = clear;
	
	return observable;
}

$.observable = createObservable;

})($);
