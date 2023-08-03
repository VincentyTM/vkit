(function($){

var createStyleContainer = $.styleContainer;
var onUnmount = $.unmount;
var tick = $.tick;

var map = typeof WeakMap === "function" ? new WeakMap() : null;
var styleCount = 0;

function prepareCSS(css, selector){
	return css.replace(/::?this\b/ig, selector);
}

function getRootNode(el){
	if( el.getRootNode ){
		return el.getRootNode();
	}
	
	while( el.parentNode ){
		el = el.parentNode;
	}
	
	return el;
}

function getStyleContainer(el){
	var docOrShadow = getRootNode(el);
	var parent = docOrShadow.head;
	
	if(!parent && docOrShadow.getElementsByTagName){
		parent = docOrShadow.getElementsByTagName("head")[0];
	}
	
	if(!parent){
		parent = docOrShadow;
	}
	
	var container = map ? map.get(parent) : parent.__styleContainer;
	
	if( container ){
		return container;
	}
	
	var container = createStyleContainer();
	var styleEl = container.element;
	
	if( map ){
		map.set(parent, container);
	}else{
		parent.__styleContainer = container;
	}
	
	parent.appendChild(styleEl);
	
	container.parent = parent;
	
	return container;
}

function createStyle(css, attr){
	if(!attr){
		attr = "vkit-" + (++styleCount);
	}
	
	var selector = "[" + attr + "]";
	
	function bind(el){
		var container = null;
		var controller = null;
		
		tick(function(){
			container = getStyleContainer(el);
			controller = container.add(selector);
			controller.setValue(prepareCSS(css && typeof css.get === "function" ? css.get() : css, selector));
		});
		
		if( css && typeof css.subscribe === "function" ){
			css.subscribe(function(value){
				if( controller ){
					controller.setValue(prepareCSS(value, selector));
				}
			});
		}
		
		if( el.setAttribute ){
			el.setAttribute(attr, "");
		}
		
		onUnmount(function(){
			if( el.removeAttribute ){
				el.removeAttribute(attr);
			}
			
			if( container && container.remove(selector) ){
				var parent = container.element.parentNode;
				
				if( parent ){
					parent.removeChild(container.element);
				}
				
				parent = container.parent;
				
				if( parent ){
					if( map ){
						map["delete"](parent);
					}else{
						delete parent.__styleContainer;
					}
				}
			}
		});	
	}
	
	bind.toString = function(){
		return selector;
	};
	
	return bind;
}

$.style = createStyle;

})($);
