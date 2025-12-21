import { classes } from "./classes.js";
import { clientRenderClasses } from "./clientRenderClasses.js";
import { ServerElement } from "./createServerElement.js";
import { createStyleContainer, StyleContainer, StyleController } from "./createStyleContainer.js";
import { CSSProperties, generateCSS } from "./generateCSS.js";
import { ClientRenderer } from "./hydrate.js";
import { onDestroy } from "./onDestroy.js";
import { serverRenderClasses } from "./serverRenderClasses.js";
import { CustomTemplate } from "./Template.js";
import { tick } from "./tick.js";

type StylableNode = Element | ShadowRoot;

interface StyleOptions {
	pseudoElement?: string;
}

export interface StyleTemplate extends CustomTemplate<StylableNode> {
	readonly className: string;
	readonly css: string;
}

type WithStyleContainer = {
	__styleContainer?: StyleContainer
};

type CSSTextOrDeclaration = string | CSSProperties;

var map = typeof WeakMap === "function" ? new WeakMap() : null;

function getRootNode(el: Node): Node {
	if (el.getRootNode) {
		return el.getRootNode();
	}

	while (el.parentNode) {
		el = el.parentNode;
	}

	return el;
}

function getStyleContainer(el: StylableNode): StyleContainer {
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
 * The style is added to the relevant stylesheet and a generated class name
 * is added to the element.
 * 
 * The style is removed from the stylesheet when no DOM elements use it anymore.
 * A style can be used in multiple documents/shadow DOMs, each having its own independent stylesheet.
 * @example
 * function MyComponent() {
 * 	return H1("Hello world", MyComponentStyle);
 * }
 * 
 * const MyComponentStyle = style({
 * 	backgroundColor: "yellow",
 * 	color: [
 * 		{value: "red"},
 * 		{on: ":hover", value: "blue"}
 * 	}
 * });
 * 
 * @param css An object or string containing the CSS.
 * 
 * If it is a string, the special `::this` selector can be used to refer to
 * all DOM elements that use the style.
 * 
 * If it is an object, its keys are the CSS property names and the values are
 * the CSS property values.
 * 
 * It is possible to use arrays of variant objects instead of string CSS property values.
 * A variant must have a `value` property which can be a string or another array of variants, recursively.
 * A variant can also have an `on` property which extends the selector,
 * e.g. with a class name or a pseudo-class like `:hover`.
 * @param options An optional object for style configuration.
 * The pseudo-element selector can be set with the `pseudoElement` property of this object.
 * The pseudo-element selector must be specified without the leading `::` symbols.
 * @returns A style template that can be added to a DOM element or a shadow root to apply the style.
 */
export function style(css: CSSTextOrDeclaration, options?: StyleOptions): StyleTemplate {
	var generatedCSS = typeof css === "string" ? css : generateCSS(css, options && options.pseudoElement);
	var className = "v" + hashGeneratedCSS(generatedCSS);

	return {
		className: className,
		css: generatedCSS,
		hydrate: clientRenderStyle,
		serverRender: serverRenderStyle
	};
}

function hashGeneratedCSS(generatedCSS: string): string {
	var hash = 1540483477;
	var n = generatedCSS.length;

	for (var i = 0; i < n; ++i) {
		hash ^= generatedCSS.charCodeAt(i);
		hash *= 1540483477;
		hash ^= hash >>> 24;
	}

	return (hash >>> 0).toString(36);
}

function isInElementContext(clientRenderer: ClientRenderer<Element | ShadowRoot>): clientRenderer is ClientRenderer<Element> {
	return !("slotAssignment" in clientRenderer.context);
}

function clientRenderStyle(
	clientRenderer: ClientRenderer<StylableNode>,
	template: StyleTemplate
): void {
	var element = clientRenderer.context;
	var generatedCSS = template.css;
	var className = template.className;
	var selector = "." + className;
	var container: StyleContainer | null = null;
	var controller: StyleController | null = null;

	tick(function(): void {
		container = getStyleContainer(element);
		controller = container.add(selector);
		controller.setValue(
			generatedCSS.replace(/::?this\b/ig, selector)
		);
	});

	if (isInElementContext(clientRenderer)) {
		clientRenderClasses(clientRenderer, classes(className));
	}

	onDestroy(function(): void {
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

function serverRenderStyle(
	serverElement: ServerElement,
	template: StyleTemplate
): void {
	serverRenderClasses(serverElement, classes(template.className));
}
