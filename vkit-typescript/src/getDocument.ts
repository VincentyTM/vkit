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
 * @returns The current document.
 */
export function getDocument(): Document | null {
	return getWindow()!.document;
}
