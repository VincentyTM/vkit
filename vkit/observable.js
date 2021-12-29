(function($){

function createObservable(){
	var subscriptions = [], callbacks = [], n = 0;
	function observable(){
		for(var i=0; i<n; ++i){
			callbacks[i].apply(null, arguments);
		}
	}
	function subscribe(callback){
		function unsubscribe(){
			for(var i=Math.min(curr, n); i--;){
				if( subscriptions[i] === unsubscribe ){
					subscriptions.splice(i, 1);
					callbacks.splice(i, 1);
					--n;
					break;
				}
			}
		}
		subscriptions.push(unsubscribe);
		callbacks.push(callback);
		var curr = ++n;
		return unsubscribe;
	}
	function getCount(){
		return n;
	}
	observable.subscribe = subscribe;
	observable.count = getCount;
	return observable;
}

$.observable = createObservable;

})($);
