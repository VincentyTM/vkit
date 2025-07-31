import { createStyleContainer, StyleContainer, StyleController } from "./createStyleContainer.js";
import { CSSProperties, generateCSS } from "./generateCSS.js";
import { ClientRenderer } from "./hydrate.js";
import { noop } from "./noop.js";
import { onDestroy } from "./onDestroy.js";
import { CustomTemplate } from "./Template.js";
import { tick } from "./tick.js";

export interface StyleTemplate extends CustomTemplate<Element | ShadowRoot> {
	readonly attribute: string;
	readonly css: CSSTextOrDeclaration;
}

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

function getStyleContainer(el: Element | ShadowRoot): StyleContainer {
	var docOrShadow = getRootNode(el);
	var parent: Node | undefined = (docOrShadow as Document).head;
	
	if (!parent && (docOrShadow as Document).getElementsByTagName) {
		parent = (docOrShadow as Document).getElementsByTagName("head")[0];
	}
	
	if (!parent) {
		parent = docOrShadow;
	}
	
	var container: StyleContainer = map !== null ? map.get(parent) : (parent as unknown as WithStyleContainer).__styleContainer;
	
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
 * @returns A style template that can be added to a DOM element or a shadow root to apply the stylesheet.
 */
export function style(css: CSSTextOrDeclaration): StyleTemplate {
	return {
		attribute: "vkit-" + (++styleCount),
		css: css,
		hydrate: clientRenderStyle,
		serverRender: noop
	};
}

function clientRenderStyle<P extends Element | ShadowRoot>(
	clientRenderer: ClientRenderer<P>,
	template: StyleTemplate
): void {
	var element = clientRenderer.context;
	var attribute = template.attribute;
	var css = template.css;
	var selector = "[" + attribute + "]";
	var container: StyleContainer | null = null;
	var controller: StyleController | null = null;
	
	tick(function(): void {
		container = getStyleContainer(element);
		controller = container.add(selector);
		controller.setValue(
			prepareCSS(css, selector)
		);
	});
	
	if ("setAttribute" in element) {
		element.setAttribute(attribute, "");
	}
	
	onDestroy(function(): void {
		if ("removeAttribute" in element) {
			element.removeAttribute(attribute);
		}
		
		if (container && container.remove(selector)) {
			var parent: Node | null = container.element.parentNode;
			
			if (parent !== null) {
				parent.removeChild(container.element);
			}
			
			parent = container.parent;
			
			if (parent !== null) {
				if (map !== null) {
					map["delete"](parent);
				} else {
					delete (parent as WithStyleContainer).__styleContainer;
				}
			}
		}
	});
}
