(function($){

$.observable = function(){
	var subscriptions = {};
	var id = 0;
	function render(){
		for(var id in subscriptions)
			subscriptions[id].apply(null, arguments);
	}
	render.subscribe = function(fn){
		var cid = ++id;
		subscriptions[cid] = fn;
		return function(){
			delete subscriptions[cid];
		};
	};
	return render;
};

})($);
