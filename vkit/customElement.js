(function($, window){

var append = $.append;
var bind = $.bind;
var createComponent = $.component;
var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var inject = $.inject;
var provide = $.provide;
var setComponent = $.setComponent;
var stateOf = $.stateOf;
var update = $.update;
var WindowService = $.windowService;

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
		var self = this;
		var el = this;
		
		while( el.parentNode !== null ){
			el = el.parentNode;
		}
		
		if( el.nodeType !== 9 && el.nodeType !== 11 ){
			return;
		}
		
		var component = this.component;
		var prev = getComponent(true);
		setComponent(component);
		
		try{
			var doc = this.ownerDocument;
			
			provide([WindowService], function(){
				inject(WindowService).window = doc.defaultView || doc.parentWindow;
				var view = getView.call(self, stateOf(self.observedAttributes), self);
				append(self, [component.start, view, component.end], self, bind);
			});
		}finally{
			setComponent(prev);
		}
		
		update();
	};
	
	proto.disconnectedCallback = function(){
		var component = this.component;
		component.removeView();
		emitUnmount(component);
		component.children.splice(0, component.children.length);
		update();
	};
	
	if( options ){
		if( options.window ){
			win = options.window;
		}
		
		if( options.adoptedCallback ){
			proto.adoptedCallback = options.adoptedCallback;
		}
		
		if( options.observedAttributes ){
			CustomElement.observedAttributes = options.observedAttributes;
			
			proto.attributeChangedCallback = function(name, oldValue, newValue){
				if( this.observedAttributes[name] !== newValue ){
					this.observedAttributes[name] = newValue;
					update();
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
