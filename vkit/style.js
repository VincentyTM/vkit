(function($){

var unmount = $.unmount;
var afterRender = $.afterRender;
var styleCount = 0;

function getText(){
	return this.text;
}

function updateCSS(container){
	var cssText = container.controllersArray.join("\n");
	if( container.textNode ){
		container.textNode.nodeValue = cssText;
	}else{
		container.element.innerText = cssText;
	}
}

function prepareCSS(css, selector){
	return css.replace(/::?this\b/ig, selector);
}

function getRootNode(el){
	var root = el.getRootNode ? el.getRootNode() : null;
	if( root ){
		return root;
	}
	var root = el;
	while( root.parentNode !== null ){
		root = root.parentNode;
	}
	return root;
}

function createStyle(css, attr){
	if(!attr){
		attr = "vkit-style" + (++styleCount);
	}
	var selector = "[" + attr + "]";
	
	function bind(el){
		var styleController = null;
		
		if( el.setAttribute ){
			el.setAttribute(attr, "");
		}
		
		afterRender(function addStyle(){
			if(!el.parentNode){
				afterRender(addStyle);
				return;
			}
			var doc = el.ownerDocument;
			var root = getRootNode(el);
			if( root !== doc && root.nodeType !== 11 ){
				afterRender(addStyle);
				return;
			}
			var container = root.styleContainer;
			if(!container){
				var head = root.getElementsByTagName ? (root.getElementsByTagName("head")[0] || root) : root;
				var style = doc.createElement("style");
				head.appendChild(style);
				var textNode;
				try{
					textNode = doc.createTextNode("");
					style.appendChild(textNode);
				}catch(ex){
					textNode = null;
				}
				container = root.styleContainer = {
					root: root,
					element: style,
					textNode: textNode,
					controllers: {},
					controllersArray: []
				};
			}
			var controllers = container.controllers;
			var controller = controllers[attr];
			if( controller ){
				++controller.refCount;
			}else{
				controller = controllers[attr] = {
					text: prepareCSS(css.get ? css.get() : css, selector),
					toString: getText,
					refCount: 1,
					container: container
				};
				container.controllersArray.push(controller);
				updateCSS(container);
			}
			styleController = controller;
		});
		
		if( css.subscribe ){
			css.subscribe(function(cssValue){
				if( styleController ){
					styleController.text = prepareCSS(cssValue, selector);
					updateCSS(styleController.container);
				}
			});
		}
		
		unmount(function(){
			if( el.removeAttribute ){
				el.removeAttribute(attr);
			}
			if( styleController && --styleController.refCount === 0 ){
				var container = styleController.container;
				var controllersArray = container.controllersArray;
				for(var i=controllersArray.length; i--;){
					if( controllersArray[i] === styleController ){
						controllersArray.splice(i, 1);
						break;
					}
				}
				delete container.controllers[attr];
				styleController = null;
				for(var k in container.controllers){
					return;
				}
				delete container.root.styleContainer;
				if( container.element.parentNode ){
					container.element.parentNode.removeChild(container.element);
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
