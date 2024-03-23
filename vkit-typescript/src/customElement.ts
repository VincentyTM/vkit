import append from "./append.js";
import bind from "./bind.js";
import createComponent, {type Component} from "./createComponent.js";
import createInjector from "./injector.js";
import createProvider from "./provider.js";
import createSignal, {type WritableSignal} from "./signal.js";
import emitUnmount from "./emitUnmount.js";
import empty from "./empty.js";
import {getValueFromClass} from "./root.js";
import inject from "./inject.js";
import tick from "./tick.js";
import update from "./update.js";
import type {View} from "./view.js";
import {WindowService} from "./getWindow.js";

var setPrototypeOf = Object.setPrototypeOf;
var rendered = false;

tick(function() {
	rendered = true;
});

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
		if (!rendered) {
			return;
		}
		
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
		if (!rendered) {
			return;
		}
		
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
				if (!rendered) {
					return;
				}
				
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
