import { getWindow } from "./getWindow.js";

/**
 * Returns the document of the current component.
 * It is useful in multi-window applications and iframes.
 * It returns null on the server.
 * @example
 * const document = getDocument();
 * 
 * if (document) {
 * 	bind(document, {
 * 		onclick() {
 * 			console.log("You clicked on the document!");
 * 		}
 * 	});
 * }
 * 
 * @returns The current document.
 */
export function getDocument(): Document | null {
	return getWindow()!.document;
}
