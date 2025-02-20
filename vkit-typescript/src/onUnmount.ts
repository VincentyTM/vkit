import { getComponent } from "./contextGuard.js";
import type { Component } from "./createComponent.js";
import noop from "./noop.js";
import observable from "./observable.js";
import { rootComponent } from "./root.js";

/**
 * Schedules a callback to be run when the current component is destroyed.
 * @param callback The handler that listens to the component unmount event.
 * @param component The component whose unmount event is handled. By default, it is the current component.
 * @returns A function that unsubscribes the callback from the component unmount event.
 */
export default function onUnmount(
	callback: () => void,
	component?: Component | null
) : (callback: () => void) => void {
	if (!component) {
		component = getComponent();
	}
	
	if (component === rootComponent) {
		return noop;
	}
	
	var c: Component | null = component;
	
	while (c && !c.unmount) {
		c.unmount = observable();
		
		if (c.parent) {
			if (c.parent.children) {
				c.parent.children.push(c);
			} else {
				c.parent.children = [c];
			}
		}
		
		c = c.parent;
	}
	
	return component!.unmount!.subscribe(callback);
}
