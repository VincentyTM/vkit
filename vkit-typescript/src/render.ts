import { append } from "./append.js";
import { bind } from "./bind.js";
import { rootComponent, rootInjector } from "./root.js";
import { setComponent, setInjector } from "./contextGuard.js";
import { update } from "./update.js";
import { Template } from "./Template.js";

/**
 * Renders the root component of the application in the DOM.
 * If there are multiple applications running on the same page, it may be called multiple times.
 * However, in most cases it is only called once and every other component is created within that single root component.
 * @example
 * function App() {
 * 	return "Hello world";
 * }
 * 
 * // This is the entry point of the application
 * render(App, document.body);
 * 
 * @param getView The top-level component. It must be a function.
 * @param container A container DOM node in which the application is rendered.
 */
export function render<ContextT extends Node>(
	getView: () => Template<ContextT>,
	container: ContextT
): void {
	try {
		setComponent(rootComponent);
		setInjector(rootInjector);
		
		var view = getView();
		
		append(container, view, container, bind);
	} finally {
		setComponent(null);
		setInjector(null);
	}
	
	update();
}
