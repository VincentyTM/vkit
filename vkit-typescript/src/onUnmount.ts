import type {Component} from "./component.js";
import {getComponent} from "./contextGuard.js";
import noop from "./noop.js";
import observable from "./observable.js";
import {rootComponent} from "./root.js";

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
