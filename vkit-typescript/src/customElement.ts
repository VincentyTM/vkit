import { append } from "./append.js";
import { bind } from "./bind.js";
import { createComponent, type Component } from "./createComponent.js";
import { createInjector } from "./createInjector.js";
import { createProvider } from "./createProvider.js";
import { emitUnmount } from "./emitUnmount.js";
import { empty } from "./empty.js";
import { getValueFromClass } from "./root.js";
import { inject } from "./inject.js";
import { signal, type WritableSignal } from "./signal.js";
import { tick } from "./tick.js";
import { update } from "./update.js";
import type { Template } from "./Template.js";
import { WindowService } from "./getWindow.js";

type CustomElementGetView = (
	this: HTMLElement,
	observedAttributes: {
		[key: string]: WritableSignal<string | null>;
	},
	element: HTMLElement
) => Template;

type CustomElementOptions = {
	adoptedCallback?: () => void;
	observedAttributes?: string[];
	window?: Window & typeof globalThis;
};

type ExtendedHTMLElement = HTMLElement & {
	observedAttributes: {
		[propName: string]: WritableSignal<string | null>;
	};
	component: Component;
};

var setPrototypeOf = Object.setPrototypeOf;
var rendered = false;

tick(function() {
	rendered = true;
});

function replaceHyphens(value: string): string {
	return value.charAt(1).toUpperCase();
}

function attrToPropName(attrName: string): string {
	return attrName.toLowerCase().replace(/\-[a-z]/g, replaceHyphens);
}

/**
 * Registers a custom element with the specified name.
 * The custom element is like a component but independent from the main tree.
 * The component is created when the element is added to the DOM.
 * The `onUnmount` callbacks are called when the element is removed from the DOM.
 * @example
 * customElement("my-element", ({name}, element) => {
 * 	return [
 * 		H1("Hello ", () => name() || "Guest"),
 * 		Div(
 * 			element.childNodes
 * 		)
 * 	];
 * }, {
 * 	observedAttributes: ["name"]
 * });
 * 
 * @param name The name of the custom element. It must contain a hyphen like `my-element`.
 * @param getView A component that returns a view. It is displayed when the custom element is present in the DOM.
 * @param options An optional configuration object with the following options:
 *  - adoptedCallback: A function that is called when the element is adopted.
 *  - observedAttributes: An array of reactive attribute names that appear in the first parameter as string-signal pairs.
 *  - window: The window in which the custom element is registered.
 * @returns The `getView` function so that it can be used as a regular component too.
 */
export function customElement(
	name: string,
	getView: CustomElementGetView,
	options?: CustomElementOptions
) {
	function CustomElement(): ExtendedHTMLElement {
		var el: ExtendedHTMLElement = Reflect.construct(
			win.HTMLElement,
			[],
			CustomElement
		);

		var injector = createInjector(null, function(token): unknown {
			var provider = createProvider(getValueFromClass, token, component);
			injector.container.set(token, provider);
			return provider.getInstance();
		});
		
		var component = createComponent(function(): void {
			var doc = el.ownerDocument;
			inject(WindowService).window = doc.defaultView || (doc as any).parentWindow;
			var view = getView.call(el, el.observedAttributes, el);
			append(el, view, el, bind);
		}, null, injector);
		
		el.component = component;
		el.observedAttributes = {};
		
		if (CustomElement.observedAttributes) {
			CustomElement.observedAttributes.forEach(function(attrName) {
				el.observedAttributes[attrToPropName(attrName)] = signal(el.getAttribute(attrName));
			});
		}
		
		return el;
	}
	
	var proto = CustomElement.prototype;
	var win = window;
	
	proto.connectedCallback = function(): void {
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
	
	proto.disconnectedCallback = function(): void {
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
			): void {
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
