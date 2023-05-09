(function($){

var createStyleContainer = $.styleContainer;
var getWindow = $.window;
var inject = $.inject;
var unmount = $.unmount;
var styleCount = 0;

function prepareCSS(css, selector){
	return css.replace(/::?this\b/ig, selector);
}

function StyleService(){
	if(!(this instanceof StyleService)){
		return inject(StyleService);
	}
	var document = getWindow().document;
	var head = document.getElementsByTagName("head")[0];
	var container = createStyleContainer(document);
	var styleEl = container.element;
	head.appendChild(styleEl);
	
	unmount(function(){
		if( styleEl.parentNode ){
			styleEl.parentNode.removeChild(styleEl);
		}
	});
	
	this.container = container;
	this.document = document;
	this.element = styleEl;
}

function createStyle(css, attr){
	if(!attr){
		attr = "vkit-" + (++styleCount);
	}
	var selector = "[" + attr + "]";
	
	function bind(el){
		var service = inject(StyleService);
		var container = service.container;
		var controller = container.add(selector);
		controller.setValue(prepareCSS(css && typeof css.get === "function" ? css.get() : css, selector));
		
		if( css && typeof css.subscribe === "function" ){
			css.subscribe(function(value){
				controller.setValue(prepareCSS(value, selector));
			});
		}
		
		if( el.setAttribute ){
			el.setAttribute(attr, "");
		}
		
		unmount(function(){
			if( el.removeAttribute ){
				el.removeAttribute(attr);
			}
			
			container.remove(selector);
		});	
	}
	
	bind.toString = function(){
		return selector;
	};
	
	return bind;
}

$.style = createStyle;
$.styleService = StyleService;

})($);
