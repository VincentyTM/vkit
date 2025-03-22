import { Component } from "./createComponent.js";

export function emitUnmount(component: Component): void {
	var children = component.children;

	if (children) {
		component.children = null;
		
		var n = children.length;
		
		for (var i = 0; i < n; ++i) {
			emitUnmount(children[i]);
		}
	}
	
	var parent = component.parent;

	if (parent) {
		var siblings = parent.children;
		
		if (siblings) {
			for (var i = siblings.length; i--;) {
				if (siblings[i] === component) {
					siblings.splice(i, 1);
					break;
				}
			}
		}
	}
	
	var destroyHandlers = component.destroyHandlers;
	
	if (destroyHandlers !== undefined) {
		component.destroyHandlers = undefined;

		var n = destroyHandlers.length;

		for(var i = 0; i < n; ++i) {
			destroyHandlers[i]();
		}
	}
}
