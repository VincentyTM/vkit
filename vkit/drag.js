(function($){

var cursorStartX, cursorStartY, elStartLeft, elStartTop, elNode=null, noop=function(){}, ondragstart=noop, ondragstop=noop, defaultDragGo=function(x,y){this.style.left=x+"px";this.style.top=y+"px";}, ondraggo=defaultDragGo;

function getX(e){ return e.touches && e.touches[0] ? e.touches[0].pageX||0 : e.pageX||e.clientX+(window.scrollX||document.documentElement.scrollLeft + (document.body ? document.body.scrollLeft : 0)||0); }
function getY(e){ return e.touches && e.touches[0] ? e.touches[0].pageY||0 : e.pageY||e.clientY+(window.scrollY||document.documentElement.scrollTop + (document.body ? document.body.scrollTop : 0)||0); }
function getStyle(el, prop){
	if( typeof getComputedStyle=="function" ){
		return getComputedStyle(el, null).getPropertyValue(prop);
	}else if( el.currentStyle ){
		return el.currentStyle[prop];
	}else if( el.style ){
		return el.style[prop];
	}
	return "";
}

function dragStart(e, target, cancel){
	e=e||window.event;
	cursorStartX=getX(e);
	cursorStartY=getY(e);
	elNode=target;
	elStartLeft=parseInt(getStyle(elNode,"left"))||elNode.offsetLeft||0;
	elStartTop=parseInt(getStyle(elNode,"top"))||elNode.offsetTop||0;
	ondragstart.call(elNode, elStartLeft + getX(e) - cursorStartX, elStartTop + getY(e) - cursorStartY);
	if( cancel ){
		e.cancelBubble=true; e.stopPropagation && e.stopPropagation();
		e.returnValue=false; e.preventDefault && e.preventDefault();
		return false;
	}
}

function dragGo(e, cancel){
	if( elNode ){
		e=e||window.event;
		ondraggo.call(elNode, elStartLeft + getX(e) - cursorStartX, elStartTop + getY(e) - cursorStartY);
		if( cancel ){
			e.cancelBubble=true; e.stopPropagation && e.stopPropagation();
			e.returnValue=false; e.preventDefault && e.preventDefault();
			return false;
		}
	}
}

function dragStop(e){
	if( elNode ){
		dragGo.call(this, e);
		ondragstop.call(elNode, elStartLeft + getX(e) - cursorStartX, elStartTop + getY(e) - cursorStartY);
		elNode=null;
	}
}

$.fn.dragZone=function(){
	return this
		.on("mouseleave", dragStop)
		.on("mouseup", dragStop)
		.on("mousemove", dragGo)
		.on("touchmove", function(e){ return dragGo(e, true); })
		.on("touchend", dragStop)
		.on("touchcancel", dragStop)
	;
};

$.fn.drag=function(target, after){
	var handler=target && typeof target=="object" ? function(e){
		dragStart(e, target, cancel);
	} : function(e, cancel){
		dragStart(e, this, cancel);
		ondraggo=target||defaultDragGo;
		ondragstop=after||noop;
	};
	for(var i=0, l=this.length; i<l; ++i){
		this[i].style.touchAction="none";
	}
	return this.on("mousedown", handler).on("touchstart", function(e){
		handler.call(this, e, true);
	});
};

})($);
