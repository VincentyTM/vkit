import { Signal } from "./computed.js";
import { isSignal } from "./isSignal.js";

/**
 * Navigates the provided window to the specified URL
 * by modifying the browser's history.
 * 
 * @example
 * function NavigationButton() {
 * 	const win = getWindow();
 * 	
 * 	return Button("About", {
 * 		onclick() {
 * 			navigate(win, "?page=about");
 * 		}
 * 	});
 * }
 * 
 * @param window - The window object to navigate.
 * @param url - The URL to navigate to.
 */
export function navigate(window: Window | null, url: string | Signal<string> | (() => string)): void {
	if (window === null) {
		return;
	}
	
	var currentURL = (
		isSignal(url) ? url.get() :
		typeof url === "function" ? url() :
		url
	);
	
	var history = window.history;

	if (!history.pushState || typeof PopStateEvent !== "function") {
		window.location.assign(currentURL);
		return;
	}

	history.pushState(null, "", currentURL);

	var event = new PopStateEvent("popstate", {state: null});
	window.dispatchEvent(event);
	window.scrollTo(0, 0);
}
