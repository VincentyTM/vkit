import {Component} from "./component";
import {getComponent} from "./contextGuard";
import noop from "./noop";
import observable from "./observable";
import {rootComponent} from "./root";

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
