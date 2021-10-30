(function($){

function fixEvent(e){
	e.preventDefault = function(){
		e.returnValue = false;
	};
	e.stopPropagation = function(){
		e.cancelBubble = true;
	};
	return e;
}

$.onEvent = function(obj, type, fn){
	function fnListener(e){
		var ret = fn.call(obj, e);
		$.render();
		return ret;
	}
	function fnAttach(){
		var ret = fn.call(obj, fixEvent(window.event));
		$.render();
		return ret;
	}
	if( obj.addEventListener ){
		obj.addEventListener(type, fnListener, false);
		return function(){
			obj.removeEventListener(type, fnListener, false);
		};
	}else if( obj.attachEvent ){
		type = "on" + type;
		obj.attachEvent(type, fnAttach);
		return function(){
			obj.detachEvent(type, fnAttach);
		};
	}
	throw new Error("Event listener could not be attached.");
};

$.fn.onEvent = function(type, fn){
	var n = this.length;
	var a = new Array(n);
	for(var i=0; i<n; ++i){
		a[i] = $.onEvent(this[i], type, fn);
	}
	return a.length === 1 ? a[0] : function(){
		for(var i=0; i<n; ++i){
			a[i]();
		}
	};
};

})($);
