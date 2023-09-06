(function($){

var bind = $.bind;
var noop = $.noop;

function dragZone(zoneTarget){
	var cursorStartX;
	var cursorStartY;
	var elStartLeft;
	var elStartTop;
	var elNode = null;
	var dragStartHandler = noop;
	var dragStopHandler = noop;
	var defaultDragGo = function(el, x, y){
		el.style.left = x + "px";
		el.style.top = y + "px";
	};
	var dragGoHandler = defaultDragGo;
	
	if( zoneTarget ){
		bindTo(zoneTarget);
	}
	
	function bindTo(zoneTarget){
		bind(zoneTarget, {
			onmouseleave: dragStop,
			onmouseup: dragStop,
			onmousemove: dragGo,
			ontouchmove: touchMove,
			ontouchend: dragStop,
			ontouchcancel: dragStop
		});
	}

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

	function draggable(options) {
		var target = options && options.move || null;
		var go = typeof target === "function" && !("current" in target) ? target : defaultDragGo;
		var start = options && options.start || noop;
		var end = options && options.end || noop;
		
		var handler = target && target.nodeType ? function(e){
			dragGoHandler = go;
			dragStartHandler = start;
			dragStopHandler = end;
			dragStart(e, target);
		}
		
		: target && "current" in target ? function(e){
			if( target.current ){
				dragGoHandler = go;
				dragStartHandler = start;
				dragStopHandler = end;
				dragStart(e, target.current);
			}
		}
		
		: function(e){
			dragGoHandler = go;
			dragStartHandler = start;
			dragStopHandler = end;
			dragStart(e, this);
		};
		
		return {
			style: {
				touchAction: "none"
			},
			onmousedown: handler,
			ontouchstart: handler
		};
	}

	function dragGo(e, cancel){
		if( elNode ){
			dragGoHandler(
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

	function dragStart(e, target){
		elNode = target;
		cursorStartX = getX(e, elNode);
		cursorStartY = getY(e, elNode);
		elStartLeft = parseInt(getStyle(elNode, "left")) || 0;
		elStartTop = parseInt(getStyle(elNode, "top")) || 0;
		
		dragStartHandler(
			elNode,
			elStartLeft + getX(e, elNode) - cursorStartX,
			elStartTop + getY(e, elNode) - cursorStartY
		);
		
		e.cancelBubble = true; e.stopPropagation && e.stopPropagation();
		e.returnValue = false; e.preventDefault && e.preventDefault();
		return false;
	}

	function dragStop(e){
		if( elNode ){
			dragGo.call(elNode, e, false);
			dragStopHandler(
				elNode,
				elStartLeft + getX(e, elNode) - cursorStartX,
				elStartTop + getY(e, elNode) - cursorStartY
			);
			elNode = null;
		}
	}

	function touchMove(e){
		return dragGo.call(this, e, true);
	}
	
	return {
		bind: bindTo,
		draggable: draggable
	};
}

$.dragZone = dragZone;

})($);
