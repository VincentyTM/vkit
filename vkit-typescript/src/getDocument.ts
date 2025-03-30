import { getWindow } from "./getWindow.js";

/**
 * Returns the current document.
 * It is useful in multi-window applications and iframes.
 * It returns null on the server.
 * @example
 * effect(() => {
 * 	console.log("Document:", getDocument());
 * });
 * 
 * @returns The document of the current window or null if it does not exist.
 */
export function getDocument(): Document | null {
	var win = getWindow();
	return win ? win.document : null;
}
