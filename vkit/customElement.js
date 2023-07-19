(function($, window){

var append = $.append;
var bind = $.bind;
var createComponent = $.component;
var emitUnmount = $.emitUnmount;
var empty = $.empty;
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
		var el = Reflect.construct(
			win.HTMLElement,
			[],
			CustomElement
		);
		
		var component = createComponent(function(){
			var doc = el.ownerDocument;
			
			provide(null, function(){
				inject(WindowService).window = doc.defaultView || doc.parentWindow;
				
				var view = getView.call(
					el,
					stateOf(el.observedAttributes),
					el
				);
				
				append(
					el,
					view,
					el,
					bind
				);
			});
		}, null, null);
		
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
		component.render();
		update();
	};
	
	proto.disconnectedCallback = function(){
		empty(this);
		emitUnmount(this.component);
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
