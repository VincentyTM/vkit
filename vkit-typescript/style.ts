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

export default function style(
	cssText: string | Signal<string>,
	attribute?: string
): (element: Node) => void {
	if (!attribute) {
		attribute = "vkit-" + (++styleCount);
	}
	
	var selector = "[" + attribute + "]";
	
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
	
	bind.toString = function() {
		return selector;
	};
	
	return bind;
}
