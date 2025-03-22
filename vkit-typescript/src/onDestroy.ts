import { getComponent } from "./contextGuard.js";
import { Component } from "./createComponent.js";
import { observable } from "./observable.js";
import { rootComponent } from "./root.js";

/**
 * Schedules a callback to be run when the current component is destroyed.
 * @param callback The handler that listens to the component destroy event.
 * @param component The component whose destroy event is handled. By default, it is the current component.
 */
export function onDestroy(
	callback: () => void,
	component?: Component | null
): void {
	if (!component) {
		component = getComponent();
	}
	
	if (component === rootComponent) {
		return;
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
	
	component!.unmount!.subscribe(callback);
}
