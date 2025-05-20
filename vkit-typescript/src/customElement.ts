import { createEffect, Effect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { destroyEffect } from "./destroyEffect.js";
import { empty } from "./empty.js";
import { WindowService } from "./getWindow.js";
import { hydrate, HydrationPointer } from "./hydrate.js";
import { inject } from "./inject.js";
import { signal, WritableSignal } from "./signal.js";
import { Template } from "./Template.js";
import { tick } from "./tick.js";
import { updateEffect } from "./updateEffect.js";

type CustomElementGetTemplate = (
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
	effect: Effect;
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
 * The `onDestroy` callbacks are called when the element is removed from the DOM.
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
 * @param getTemplate A function that returns a template.
 * The template is created and rendered when the custom element appears in the DOM.
 * When the element is removed, the component is destroyed with its side effects.
 * @param options An optional configuration object with the following options:
 *  - adoptedCallback: A function that is called when the element is adopted.
 *  - observedAttributes: An array of reactive attribute names that appear in the first parameter as string-signal pairs.
 *  - window: The window in which the custom element is registered.
 * @returns The `getView` function.
 */
export function customElement<T extends CustomElementGetTemplate>(
	name: string,
	getTemplate: T,
	options?: CustomElementOptions
): T {
	function CustomElement(): ExtendedHTMLElement {
		var el: ExtendedHTMLElement = Reflect.construct(
			win.HTMLElement,
			[],
			CustomElement
		);

		var injector = createInjector(undefined, true);
		
		var effect = createEffect(undefined, injector, function(): void {
			var doc = el.ownerDocument;
			inject(WindowService).window = doc.defaultView || (doc as any).parentWindow;
			var view = getTemplate.call(el, el.observedAttributes, el);

			var pointer: HydrationPointer<ExtendedHTMLElement> = {
				context: el,
				currentNode: null,
				isSVG: false,
				parentEffect: effect,
				stopNode: null
			};

			hydrate(pointer, view);
		});
		
		el.effect = effect;
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
	
	proto.connectedCallback = function(this: ExtendedHTMLElement): void {
		if (!rendered) {
			return;
		}
		
		var el: ParentNode = this;
		
		while (el.parentNode !== null) {
			el = el.parentNode;
		}
		
		if (el.nodeType !== 9 && el.nodeType !== 11) {
			return;
		}
		
		var effect = this.effect;
		updateEffect(effect);
	};
	
	proto.disconnectedCallback = function(this: ExtendedHTMLElement): void {
		if (!rendered) {
			return;
		}
		
		if (this.shadowRoot) {
			empty(this.shadowRoot);
		}
		
		empty(this);
		destroyEffect(this.effect);
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
			};
		}
	}
	
	setPrototypeOf(proto, win.HTMLElement.prototype);
	setPrototypeOf(CustomElement, win.HTMLElement);
	
	win.customElements.define(name, CustomElement as unknown as CustomElementConstructor);
	
	return getTemplate;
}
