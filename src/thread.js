(function($){

if(!(typeof Worker=="function" && typeof URL=="function" && typeof Blob=="function" && typeof Promise=="function" && Array.from)){
	return;
}

var workerSRC=URL.createObjectURL(new Blob(["'use strict';this.onmessage=function(e){this.postMessage(new Function(e.data[0].split(','),e.data[1]).apply(this,e.data[2]));};"]));

function Thread(){
	var thread=this;
	this.curr=null;
	this.queue=[];
	this.worker=new Worker(workerSRC);
	this.worker.onmessage=function(e){
		thread.curr.complete(e.data);
		if( thread.queue.length ){
			thread.run(thread.queue.shift());
		}else{
			thread.curr=null;
		}
	};
}

Thread.prototype.run=function(task){
	var f=task.func.toString(),
	a=f.indexOf("(")+1,
	b=f.indexOf(")", a),
	c=f.indexOf("{", b)+1,
	d=f.lastIndexOf("}");
	this.curr=task;
	this.worker.postMessage([
		f.substring(a, b),
		f.substring(c, d),
		task.args
	]);
};

Thread.prototype.stop=function(){
	this.worker.terminate();
	this.queue.splice(0, this.queue.length);
	return this;
};

Thread.prototype.task=function(func){
	var thread=this;
	return function(){
		var args=Array.from(arguments);
		return new Promise(function(resolve){
			new Task(func, args, resolve, thread);
		});
	};
};

function Task(func, args, complete, thread){
	this.func=func;
	this.args=args;
	this.complete=complete;
	thread.curr ? thread.queue.push(this) : thread.run(this);
}

$.thread=function(){
	return new Thread();
};

})($);
