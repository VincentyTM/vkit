(function($){

var unmount = $.unmount;
var render = $.render;

function preventDefault(){
	this.returnValue = false;
}

function stopPropagation(){
	this.cancelBubble = true;
}

function onEvent(obj, type, fn){
	function eventHandler(e){
		if(!e.preventDefault) e.preventDefault = preventDefault;
		if(!e.stopPropagation) e.stopPropagation = stopPropagation;
		var ret = fn.call(obj, e);
		if( ret && typeof ret.then === "function" ){
			ret.then(render);
		}
		render();
		return ret;
	}
	if( obj.addEventListener ){
		obj.addEventListener(type, eventHandler, false);
		return function(){
			obj.removeEventListener(type, eventHandler, false);
		};
	}else if( obj.attachEvent ){
		type = "on" + type;
		obj.attachEvent(type, eventHandler);
		return function(){
			obj.detachEvent(type, eventHandler);
		};
	}
	throw new Error("Event listener could not be attached.");
}

function onEventAll(type, fn){
	var n = this.length;
	var a = new Array(n);
	for(var i=0; i<n; ++i){
		a[i] = onEvent(this[i], type, fn);
	}
	return a.length === 1 ? a[0] : function(){
		for(var i=0; i<n; ++i){
			a[i]();
		}
	};
}

function on(type, action){
	return function(el){
		unmount(onEvent(el, type, action));
	};
}

$.on = on;
$.onEvent = onEvent;
$.fn.onEvent = onEventAll;

})($);
