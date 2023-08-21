import {callTicks} from "./tick";

var queue: (() => void)[] = [];

var queueMt = queueMicrotask || (typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback: () => void){ Promise.resolve().then(callback); }
	: function(callback: () => void){ setTimeout(callback, 0); });

function enqueueUpdate(callback: () => void){
	if( queue.push(callback) === 1 ){
		queueMt(update);
	}
}

function dequeueUpdate(callback: () => void){
	for(var i=queue.length; i--;){
		if( queue[i] === callback ){
			queue.splice(i, 1);
			break;
		}
	}
}

function update(){
	var n;
	
	while( n = queue.length ){
		var updates = queue;
		queue = [];
		
		for(var i=0; i<n; ++i){
			updates[i]();
		}
	}
	
	callTicks();
}

export {dequeueUpdate, enqueueUpdate};

export default update;
