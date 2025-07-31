import { createStyleContainer, StyleContainer, StyleController } from "./createStyleContainer.js";
import { directive, DirectiveTemplate } from "./directive.js";
import { CSSProperties, generateCSS } from "./generateCSS.js";
import { onDestroy } from "./onDestroy.js";
import { tick } from "./tick.js";

type WithStyleContainer = {
	__styleContainer?: StyleContainer
};

type CSSTextOrDeclaration = string | CSSProperties;

var map = typeof WeakMap === "function" ? new WeakMap() : null;
var styleCount = 0;

function prepareCSS(css: CSSTextOrDeclaration, selector: string): string {
	var cssText = typeof css === "string" ? css : generateCSS(css);
	return cssText.replace(/::?this\b/ig, selector);
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
 * The style is added to an element with an attribute which is removed when the current reactive context (the context in which the style was added to the element) is destroyed.
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
 * @param css A string containing the CSS. The special `::this` selector in it refers to all DOM elements that use the stylesheet.
 * A signal containing a string is also accepted, which is useful for creating a dynamic stylesheet.
 * Instead of a string, an object containing CSS properties is also allowed but in that case the selector cannot be specified.
 * @param attribute The attribute used as a CSS selector. If not specified, a unique attribute is generated for the stylesheet.
 * @returns A function which can be used as a directive on a DOM element to apply the stylesheet.
 */
export function style(
	css: CSSTextOrDeclaration,
	attribute?: string
): DirectiveTemplate<Node> {
	if (!attribute) {
		attribute = "vkit-" + (++styleCount);
	}
	
	var selector = "[" + attribute + "]";
	
	/**
	 * Adds the stylesheet's selector attribute to a DOM element and keeps a reference to that element.
	 * The attribute is removed when the current reactive context (the context in which the `bind` function was called) is destroyed.
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
		
		tick(function(): void {
			container = getStyleContainer(element);
			controller = container.add(selector);
			controller.setValue(
				prepareCSS(css, selector)
			);
		});
		
		if ((element as Element).setAttribute) {
			(element as Element).setAttribute(attribute!, "");
		}
		
		onDestroy(function(): void {
			if ((element as Element).removeAttribute) {
				(element as Element).removeAttribute(attribute!);
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
	
	return directive(bind);
}
