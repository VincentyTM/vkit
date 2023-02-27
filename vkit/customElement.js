(function($, window){

var bind = $.bind;
var append = $.append;
var render = $.render;
var createComponent = $.component;
var getCurrentComponent = $.currentComponent;
var setCurrentComponent = $.setCurrentComponent;

function setPrototypeOf(obj, proto){
	if( Object.setPrototypeOf ){
		Object.setPrototypeOf(obj, proto);
	}else{
		obj.__proto__ = proto;
	}
}

function createCustomElement(name, getView, options){
	function CustomElement(){
		var el = Reflect.construct(win.HTMLElement, [], CustomElement);
		var component = createComponent(null);
		el.component = component;
		el.observedAttributes = {};
		if( CustomElement.observedAttributes ){
			CustomElement.observedAttributes.forEach(function(attrName){
				el.observedAttributes[attrName] = el.getAttribute(attrName);
			});
		}
		return el;
	}
	
	var proto = CustomElement.prototype;
	var win = window;
	
	proto.connectedCallback = function(){
		var el = this;
		while( el.parentNode !== null ){
			el = el.parentNode;
		}
		if( el.nodeType !== 9 && el.nodeType !== 11 ){
			return;
		}
		var component = this.component;
		var prev = getCurrentComponent(true);
		setCurrentComponent(component);
		try{
			var view = getView.call(this);
			append(this, [component.start, view, component.end], this, bind);
		}finally{
			setCurrentComponent(prev);
		}
	};
	
	proto.disconnectedCallback = function(){
		var component = this.component;
		component.removeView();
		component.unmount();
		component.children.splice(0, component.children.length);
	};
	
	if( options ){
		if( options.window ) win = options.window;
		if( options.adoptedCallback ) proto.adoptedCallback = options.adoptedCallback;
		if( options.observedAttributes ){
			CustomElement.observedAttributes = options.observedAttributes;
			proto.attributeChangedCallback = function(name, oldValue, newValue){
				if( this.observedAttributes[name] !== newValue ){
					this.observedAttributes[name] = newValue;
					render();
				}
			};
		}
	}
	
	setPrototypeOf(proto, win.HTMLElement.prototype);
	setPrototypeOf(CustomElement, win.HTMLElement);
	
	win.customElements.define(name, CustomElement);
	
	return getView;
}

$.customElement = createCustomElement;

})($, window);
