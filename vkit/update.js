(function($, g){

var callTicks = $.callTicks;
var rootComponent = $.rootComponent;
var queue = [];

var queueMicrotask = g.queueMicrotask || (typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback){ Promise.resolve().then(callback); }
	: function(callback){ setTimeout(callback, 0); });

function enqueueUpdate(update){
	queue.push(update);
	
	if( queue.length === 1 ){
		queueMicrotask(update);
	}
}

function dequeueUpdate(update){
	for(var i=queue.length; i--;){
		if( queue[i] === update ){
			queue.splice(i, 1);
			break;
		}
	}
}

function update(){
	var n;
	
	do{
		while( n = queue.length ){
			var updates = queue.splice(0, n);
			
			for(var i=0; i<n; ++i){
				updates[i]();
			}
		}
		
		rootComponent.update();
	}while(n);
	
	callTicks();
}

$.dequeueUpdate = dequeueUpdate;
$.enqueueUpdate = enqueueUpdate;
$.update = update;

})($, this);
