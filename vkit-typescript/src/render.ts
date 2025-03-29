import { append } from "./append.js";
import { bind } from "./bind.js";
import { createEffect } from "./createEffect.js";
import { createInjector } from "./createInjector.js";
import { destroyEffect } from "./destroyEffect.js";
import { WindowService } from "./getWindow.js";
import { inject } from "./inject.js";
import { Template } from "./Template.js";
import { updateEffect } from "./updateEffect.js";

export interface RenderRoot {
	destroy(): void;
}

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
 * const appRoot = render(App, document.body);
 * 
 * // Destroy the effects after 1 second
 * setTimeout(() => appRoot.destroy(), 1000);
 * 
 * @param getTemplate The top-level component. It must be a function.
 * @param container A container DOM node in which the application is rendered.
 * @returns An object that can be used to destroy the rendered effects.
 */
export function render<P extends Node>(getTemplate: () => Template<P>, container: P): RenderRoot {
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
	
	return {
		destroy: function(): void {
			destroyEffect(rootEffect);
		}
	};
}
