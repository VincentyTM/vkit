import append from "./append";
import bind from "./bind";
import createComponent from "./component";
import createSignal, {WritableSignal} from "./signal";
import emitUnmount from "./emitUnmount";
import empty from "./empty";
import inject from "./inject";
import provide from "./provide";
import update from "./update";
import {View} from "./view";
import {WindowService} from "./window";

function setPrototypeOf(object: object, proto: object){
	if( Object.setPrototypeOf ){
		Object.setPrototypeOf(object, proto);
	}else{
		(object as {__proto__: object}).__proto__ = proto;
	}
}

function replaceHyphens(value: string){
	return value.charAt(1).toUpperCase();
}

function attrToPropName(attrName: string){
	return attrName.toLowerCase().replace(/\-[a-z]/g, replaceHyphens);
}

function createCustomElement(name: string, getView: (
	this: HTMLElement,
	observedAttributes: {[key: string]: WritableSignal<string | null>},
	element: HTMLElement
) => View, options?: {
	adoptedCallback?: () => void,
	observedAttributes?: string[],
	window?: Window & typeof globalThis
}){
	function CustomElement(): typeof win.HTMLElement{
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
					el.observedAttributes,
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
				el.observedAttributes[attrToPropName(attrName)] = createSignal(el.getAttribute(attrName));
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
		if( this.shadowRoot ){
			empty(this.shadowRoot);
		}
		
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
			
			proto.attributeChangedCallback = function(attrName: string, _oldValue: string | null, newValue: string | null){
				this.observedAttributes[attrToPropName(attrName)].set(newValue);
				update();
			};
		}
	}
	
	setPrototypeOf(proto, win.HTMLElement.prototype);
	setPrototypeOf(CustomElement, win.HTMLElement);
	
	win.customElements.define(name, CustomElement as unknown as CustomElementConstructor);
	
	return getView;
}

export default createCustomElement;
