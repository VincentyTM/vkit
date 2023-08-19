(function($){

var unmount = $.unmount;
var update = $.update;

function preventDefault(){
	this.returnValue = false;
}

function stopPropagation(){
	this.cancelBubble = true;
}

function onEvent(obj, type, fn){
	function eventListener(e){
		if(!e.preventDefault){
			e.preventDefault = preventDefault;
		}
		
		if(!e.stopPropagation){
			e.stopPropagation = stopPropagation;
		}
		
		var ret = fn.call(obj, e);
		
		if( ret && typeof ret.then === "function" ){
			ret.then(update);
		}
		
		update();
		
		return ret;
	}
	
	if( obj.addEventListener ){
		obj.addEventListener(type, eventListener, false);
		
		return function(){
			obj.removeEventListener(type, eventListener, false);
		};
	}else if( obj.attachEvent ){
		type = "on" + type;
		obj.attachEvent(type, eventListener);
		
		return function(){
			obj.detachEvent(type, eventListener);
		};
	}
	
	throw new Error("Event listener could not be attached.");
}

function on(type, action){
	return function(el){
		unmount(onEvent(el, type, action));
	};
}

$.on = on;
$.onEvent = onEvent;

})($);
