import { onEvent } from "./onEvent.js";
import { render } from "./render.js";
import { Template } from "./Template.js";

/**
 * Renders a component tree in the specified window.
 * When the window is unloaded, the component tree is destroyed.
 * This method can be used to render contents in a newly opened window.
 * @example
 * const win = window.open();
 * 
 * if (win) {
 * 	windowContent(win, () => "Hello world");
 * }
 * @param window The window where the template is rendered.
 * @param getTemplate The root component to be rendered in the window.
 */
export function windowContent(window: Window, getTemplate: () => Template<HTMLElement>): void {
	var root = render(function(): Template<HTMLElement> {
		onEvent(window, "unload", function(): void {
			root.destroy();
		});

		return getTemplate();
	}, window.document.body);
}
