import append from "./append";
import bind from "./bind";
import createComponent from "./component";
import createInjector from "./injector";
import createProvider from "./provider";
import createSignal, {WritableSignal} from "./signal";
import emitUnmount from "./emitUnmount";
import empty from "./empty";
import {getValueFromClass} from "./root";
import inject from "./inject";
import update from "./update";
import {View} from "./view";
import {WindowService} from "./window";

function replaceHyphens(value: string) {
	return value.charAt(1).toUpperCase();
}

function attrToPropName(attrName: string) {
	return attrName.toLowerCase().replace(/\-[a-z]/g, replaceHyphens);
}

export default function createCustomElement(
	name: string,
	getView: (
		this: HTMLElement,
		observedAttributes: {[key: string]: WritableSignal<string | null>},
		element: HTMLElement
	) => View,
	options?: {
		adoptedCallback?: () => void,
		observedAttributes?: string[],
		window?: Window & typeof globalThis
	}
) {
	function CustomElement(): typeof win.HTMLElement {
		var el = Reflect.construct(
			win.HTMLElement,
			[],
			CustomElement
		);

		var injector = createInjector(null, function(token) {
			var provider = createProvider(getValueFromClass, token, component);
			injector.container.set(token, provider);
			return provider.getInstance();
		});
		
		var component = createComponent(function() {
			var doc = el.ownerDocument;
			
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
		}, null, injector);
		
		el.component = component;
		el.observedAttributes = {};
		
		if (CustomElement.observedAttributes) {
			CustomElement.observedAttributes.forEach(function(attrName) {
				el.observedAttributes[attrToPropName(attrName)] = createSignal(el.getAttribute(attrName));
			});
		}
		
		return el;
	}
	
	var proto = CustomElement.prototype;
	var win = window;
	
	proto.connectedCallback = function() {
		var el = this;
		
		while (el.parentNode !== null) {
			el = el.parentNode;
		}
		
		if (el.nodeType !== 9 && el.nodeType !== 11) {
			return;
		}
		
		var component = this.component;
		component.render();
		update();
	};
	
	proto.disconnectedCallback = function() {
		if (this.shadowRoot) {
			empty(this.shadowRoot);
		}
		
		empty(this);
		emitUnmount(this.component);
		update();
	};
	
	if (options) {
		if (options.window) {
			win = options.window;
		}
		
		if (options.adoptedCallback) {
			proto.adoptedCallback = options.adoptedCallback;
		}
		
		if (options.observedAttributes) {
			CustomElement.observedAttributes = options.observedAttributes;
			
			proto.attributeChangedCallback = function(
				attrName: string,
				_oldValue: string | null,
				newValue: string | null
			) {
				this.observedAttributes[attrToPropName(attrName)].set(newValue);
				update();
			};
		}
	}
	
	Object.setPrototypeOf(proto, win.HTMLElement.prototype);
	Object.setPrototypeOf(CustomElement, win.HTMLElement);
	
	win.customElements.define(name, CustomElement as unknown as CustomElementConstructor);
	
	return getView;
}
