import { getCurrentScript } from "./getCurrentScript.js";
import { render, RenderRoot } from "./render.js";
import { Template } from "./Template.js";

/**
 * Replaces the current script element with the rendered DOM nodes.
 * It can be used instead of `render` if the target element is not known.
 * 
 * Works with both inline and external scripts.
 * Does not work with module type script elements.
 * @example
 * function App() {
 * 	return "Hello world";
 * }
 * 
 * replaceScript(App);
 * @param getTemplate The component to replace the script element with.
 * @returns A render root object.
 */
export function replaceScript(getTemplate: () => Template<unknown>): RenderRoot {
	var script = getCurrentScript(document);

	if (script.parentNode === null || script.parentNode.nodeType !== 1) {
		throw new Error("The current script's parent node must be an HTML element");
	}

	return render(getTemplate, script.parentNode as HTMLElement, {
		endNode: script.nextSibling,
		startNode: script
	});
}
