import { inject } from "./inject.js";
import { StyleService } from "./style.js";

/**
 * Sets the style element to be used for style templates.
 * 
 * This function allows you to select which server-rendered style element to reuse.
 * If this function is not invoked, the first style element in the head will be chosen,
 * or a new style element will be inserted into the head if none exist.
 * Calling this function does not affect styles in other documents or shadow DOMs.
 * 
 * @param styleElement The style element to be used.
 * 
 * @example
 * // Document (server only)
 * 
 * function ServerDocument() {
 * 	return Html(
 * 		Head(
 * 			Style(), // some other style element
 * 			Style({id: "my-style"}, styleOutlet()) // this will be used
 * 		),
 * 		Body(App())
 * 	);
 * }
 * 
 * // App root (universal: both client and server side)
 * 
 * function App() {
 * 	const win = getWindow();
 * 
 * 	if (win !== null) {
 * 		const styleElement = win.document.querySelector("#my-style");
 * 
 * 		if (styleElement !== null) {
 * 			setStyleElement(styleElement);
 * 		}
 * 	}
 * 
 * 	return H1("Hello world", TitleStyle);
 * }
 * 
 * const TitleStyle = style({
 * 	color: "red"
 * });
 */
export function setStyleElement(styleElement: HTMLStyleElement): void {
	inject(StyleService).styleElement = styleElement;
}
