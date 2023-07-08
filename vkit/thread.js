(function($, global){

var createPromise = $.promise;
var update = $.update;

var URL = global.URL || global.webkitURL || global.mozURL;
var isSupported = typeof Worker === "function" && typeof URL === "function" && typeof Blob === "function";
var slice = Array.prototype.slice;
var workerSRC = isSupported ? URL.createObjectURL(new Blob(["'use strict';this.onmessage=function(e){this.postMessage(new Function(e.data[0].split(','),e.data[1]).apply(this,e.data[2]));};"])) : null;

function createThread(){
	if(!isSupported){
		throw new Error("Thread API is not supported");
	}
	
	var current = null;
	var queue = [];
	var worker = new Worker(workerSRC);
	
	worker.onmessage = function(e){
		current.complete(e.data);
		
		if( queue.length ){
			run(queue.shift());
		}else{
			current = null;
		}
		
		update();
	};
	
	function run(task){
		if(!worker){
			return;
		}
		
		var f = task.func.toString(),
		a = f.indexOf("(") + 1,
		b = f.indexOf(")", a),
		c = f.indexOf("{", b) + 1,
		d = f.lastIndexOf("}");
		current = task;
		worker.postMessage([
			f.substring(a, b),
			f.substring(c, d),
			task.args
		]);
	}
	
	function stop(){
		if( worker ){
			worker.terminate();
			worker = null;
			queue.splice(0, queue.length);
		}
	}
	
	function createTask(func){
		return function(){
			var args = slice.call(arguments);
			return createPromise(function(resolve){
				var task = {
					func: func,
					args: args,
					complete: resolve
				};
				current ? queue.push(task) : run(task);
			});
		};
	}
	
	return {
		run: run,
		stop: stop,
		task: createTask
	};
}

$.thread = createThread;

})($, this);
