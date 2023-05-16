(function($){

var cursorStartX;
var cursorStartY;
var elStartLeft;
var elStartTop;
var elNode = null;

function noop(){}

var ondragstart = noop;
var ondragstop = noop;
var defaultDragGo = function(x, y){
	this.style.left = x + "px";
	this.style.top = y + "px";
};
var ondraggo = defaultDragGo;

function getX(e, el){
	var doc = el.ownerDocument;
	var win = doc.defaultView || doc.parentWindow;
	return e.touches && e.touches[0] ? e.touches[0].pageX || 0 : e.pageX || e.clientX + (
		win.scrollX || doc.documentElement.scrollLeft + (doc.body ? doc.body.scrollLeft : 0) || 0
	);
}

function getY(e, el){
	var doc = el.ownerDocument;
	var win = doc.defaultView || doc.parentWindow;
	return e.touches && e.touches[0] ? e.touches[0].pageY || 0 : e.pageY || e.clientY + (
		win.scrollY || doc.documentElement.scrollTop + (doc.body ? doc.body.scrollTop : 0) || 0
	);
}

function getStyle(el, prop){
	if( typeof getComputedStyle === "function" ){
		return getComputedStyle(el, null).getPropertyValue(prop);
	}else if( el.currentStyle ){
		return el.currentStyle[prop];
	}else if( el.style ){
		return el.style[prop];
	}
	return "";
}

function dragStart(e, target, cancel){
	elNode = target;
	cursorStartX = getX(e, elNode);
	cursorStartY = getY(e, elNode);
	elStartLeft = parseInt(getStyle(elNode, "left")) || elNode.offsetLeft || 0;
	elStartTop = parseInt(getStyle(elNode, "top")) || elNode.offsetTop || 0;
	ondragstart.call(
		elNode,
		elStartLeft + getX(e, elNode) - cursorStartX,
		elStartTop + getY(e, elNode) - cursorStartY
	);
	if( cancel ){
		e.cancelBubble = true; e.stopPropagation && e.stopPropagation();
		e.returnValue = false; e.preventDefault && e.preventDefault();
		return false;
	}
}

function dragGo(e, cancel){
	if( elNode ){
		ondraggo.call(
			elNode,
			elStartLeft + getX(e, elNode) - cursorStartX,
			elStartTop + getY(e, elNode) - cursorStartY
		);
		if( cancel ){
			e.cancelBubble = true; e.stopPropagation && e.stopPropagation();
			e.returnValue = false; e.preventDefault && e.preventDefault();
			return false;
		}
	}
}

function dragStop(e){
	if( elNode ){
		dragGo.call(elNode, e);
		ondragstop.call(
			elNode,
			elStartLeft + getX(e, elNode) - cursorStartX,
			elStartTop + getY(e, elNode) - cursorStartY
		);
		elNode = null;
	}
}

function drag(target, after){
	var handler = target && typeof target === "object" ? function(e){
		dragStart(e, target, cancel);
	} : function(e, cancel){
		dragStart(e, this, cancel);
		ondraggo = target || defaultDragGo;
		ondragstop = after || noop;
	};
	
	return {
		style: {
			touchAction: "none"
		},
		onmousedown: handler,
		ontouchstart: function(e){
			handler.call(this, e, true);
		}
	};
}

function touchMove(e){
	return dragGo.call(this, e, true);
}

$.dragZone = {
	onmouseleave: dragStop,
	onmouseup: dragStop,
	onmousemove: dragGo,
	ontouchmove: touchMove,
	ontouchend: dragStop,
	ontouchcancel: dragStop
};

$.drag = drag;

})($);
