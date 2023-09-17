import createStyleContainer, {StyleContainer, StyleController} from "./styleContainer";
import onUnmount from "./onUnmount";
import {Signal} from "./signal";
import tick from "./tick";

type WithStyleContainer = {
	__styleContainer?: StyleContainer
};

var map = typeof WeakMap === "function" ? new WeakMap() : null;
var styleCount = 0;

function prepareCSS(css: string, selector: string): string {
	return css.replace(/::?this\b/ig, selector);
}

function getRootNode(el: Node): Node {
	if (el.getRootNode) {
		return el.getRootNode();
	}
	
	while (el.parentNode) {
		el = el.parentNode;
	}
	
	return el;
}

function getStyleContainer(el: Node): StyleContainer {
	var docOrShadow = getRootNode(el);
	var parent: Node | undefined = (docOrShadow as Document).head;
	
	if (!parent && (docOrShadow as Document).getElementsByTagName) {
		parent = (docOrShadow as Document).getElementsByTagName("head")[0];
	}
	
	if (!parent) {
		parent = docOrShadow;
	}
	
	var container: StyleContainer = map ? map.get(parent) : (parent as unknown as WithStyleContainer).__styleContainer;
	
	if (container) {
		return container;
	}
	
	container = createStyleContainer();
	var styleEl = container.element;
	
	if (map) {
		map.set(parent, container);
	} else {
		(parent as unknown as WithStyleContainer).__styleContainer = container;
	}
	
	parent.appendChild(styleEl);
	
	container.parent = parent;
	
	return container;
}

/**
 * Creates a style which can be applied to one or more DOM elements.
 * 
 * The style is added to an element with an attribute which is removed when the current component (the component in which the style was added to the element) is unmounted.
 * 
 * The stylesheet is removed from the document or shadow root when no DOM elements use it anymore.
 * A style can be used in multiple documents/shadow DOMs, each having their own independent stylesheet.
 * @example
 * const MyStyle = $.style(`
 * 	::this {
 * 		color: red;
 * 	}
 * `);
 * 
 * const MyComponent = () => {
 * 	return H1("Hello world", MyStyle);
 * };
 * 
 * @param cssText A string containing the CSS. The special `::this` selector in it refers to all DOM elements that use the stylesheet.
 * A signal containing a string is also accepted, which is useful for creating a dynamic stylesheet.
 * @param attribute The attribute used as a CSS selector. If not specified, a unique attribute is generated for the stylesheet.
 * @returns A function which can be used as a directive on a DOM element to apply the stylesheet.
 */
export default function style(
	cssText: string | Signal<string>,
	attribute?: string
): (element: Node) => void {
	if (!attribute) {
		attribute = "vkit-" + (++styleCount);
	}
	
	var selector = "[" + attribute + "]";
	
	/**
	 * Adds the stylesheet's selector attribute to a DOM element and keeps a reference to that element.
	 * The attribute is removed when the current component (the component in which the `bind` function was called) is unmounted.
	 * 
	 * @param element The DOM element to which the attribute is added.
	 * The `::this` selector in the stylesheet selects this element.
	 */
	function bind(element: Node): void {
		var container: StyleContainer | null = null;
		var controller: StyleController | null = null;
		
		if (!element || !element.nodeType) {
			throw new Error("Style can only be added to a DOM node");
		}
		
		tick(function() {
			container = getStyleContainer(element);
			controller = container.add(selector);
			controller.setValue(
				prepareCSS(
					cssText && typeof (cssText as Signal<string>).get === "function" ? (cssText as Signal<string>).get() : (cssText as string),
					selector
				)
			);
		});
		
		if (cssText && typeof (cssText as Signal<string>).subscribe === "function") {
			(cssText as Signal<string>).subscribe(function(value) {
				if (controller) {
					controller.setValue(prepareCSS(value, selector));
				}
			});
		}
		
		if ((element as HTMLElement).setAttribute) {
			(element as HTMLElement).setAttribute(attribute!, "");
		}
		
		onUnmount(function() {
			if ((element as HTMLElement).removeAttribute) {
				(element as HTMLElement).removeAttribute(attribute!);
			}
			
			if (container && container.remove(selector)) {
				var parent: Node | null | undefined = container.element.parentNode;
				
				if (parent) {
					parent.removeChild(container.element);
				}
				
				parent = container.parent;
				
				if (parent) {
					if (map) {
						map["delete"](parent);
					} else {
						delete (parent as WithStyleContainer).__styleContainer;
					}
				}
			}
		});	
	}
	
	return bind;
}
