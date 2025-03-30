import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { Template } from "./Template.js";

/**
 * The `href` template allows navigation within a single page application
 * without reloading it.
 * 
 * In addition to setting a link's `href` property, it prevents the
 * default navigation and uses the browser's history API to stay on the
 * same page while changing the URL.
 * 
 * @example
 * const A = htmlTag("a");
 * 
 * function MyLink() {
 * 	return A("My Path", href("/my-path"));
 * }
 * @param url A static or dynamic URL that the link should point to.
 * @returns A template which can be applied on hyperlink elements (`A` and `Area`).
 */
export function href(
	url: string | Signal<string> | (() => string)
): Template<HTMLAnchorElement> & Template<HTMLAreaElement> {
	var win = getWindow();
	
	return {
		href: url,
		onclick: function(e: Event): void {
			e.preventDefault();

            if (win === null) {
				return;
			}
			
			var currentURL = (
				isSignal(url) ? url.get() :
				typeof url === "function" ? url() :
				url
			);
			
			var history = win.history;

			if (!history.pushState || typeof PopStateEvent !== "function") {
				win.location.assign(currentURL);
				return;
			}

			history.pushState(null, "", currentURL);

			var event = new PopStateEvent("popstate", {state: null});
			win.dispatchEvent(event);
			win.scrollTo(0, 0);
		}
	};
}
