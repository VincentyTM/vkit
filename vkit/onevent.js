(function($){

var unmount = $.unmount;
var render = $.render;
var slice = Array.prototype.slice;

function fixEvent(e){
	e.preventDefault = function(){
		e.returnValue = false;
	};
	e.stopPropagation = function(){
		e.cancelBubble = true;
	};
	return e;
}

function onEvent(obj, type, fn){
	function eventHandler(){
		var args = slice.call(arguments);
		if(!args[0]){
			args[0] = fixEvent(window.event);
		}
		var ret = fn.apply(obj, args);
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
