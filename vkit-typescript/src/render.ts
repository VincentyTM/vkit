import { append } from "./append.js";
import { bind } from "./bind.js";
import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { WindowService } from "./getWindow.js";
import { inject } from "./inject.js";
import { Template } from "./Template.js";
import { updateEffect } from "./updateEffect.js";

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
 * @param getTemplate The top-level component. It must be a function.
 * @param container A container DOM node in which the application is rendered.
 */
export function render<P extends Node>(
	getTemplate: () => Template<P>,
	container: P
): void {
	var doc = container.ownerDocument;
	var win: (Window & typeof globalThis) | null = doc && doc.defaultView || (doc as any).parentWindow || null;

	var rootInjector = createInjector(undefined, true);
	var rootEffect = createEffect(undefined, rootInjector, function(): void {
		inject(WindowService).window = win;
		
		append(
			container,
			getTemplate(),
			container,
			bind
		);
	});

	updateEffect(rootEffect);
}
