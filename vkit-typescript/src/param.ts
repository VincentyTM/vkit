import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { inject } from "./inject.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { RenderConfigService } from "./RenderConfigService.js";

/**
 * Returns a signal containing the current value of the specified URL query parameter.
 * 
 * The query parameter can be used to create a router, for example.
 * @example
 * function SimpleRouter() {
 * 	const currentPage = param("page");
 * 
 * 	return [
 * 		A("Home", href("?page=home")),
 * 		" | ",
 * 		A("About", href("?page=about")),
 * 
 * 		Br(),
 * 
 * 		view(() => {
 * 			switch (currentPage()) {
 * 				case "home":
 * 					return "This is the 'Home' page!";
 * 				case "about":
 * 					return "This is the 'About' page!";
 * 				default:
 * 					return "Not found!";
 * 			}
 * 		})
 * 	];
 * }
 * @param paramName The name of the URL query parameter.
 * @returns A read-only signal with the query parameter value.
 */
export function param(paramName: string | Signal<string>): Signal<string> {
	var win = getWindow();

	if (win) {
		var path = computed(selectWindowSearchParam, [win, paramName]);

		onDestroy(onEvent(win, "popstate", function(): void {
			path.invalidate();
		}));

		return path;
	}

	var request = inject(RenderConfigService).request;
	return computed(selectSearchParam, [request && request.url || "", paramName]);
}

function selectSearchParam(url: string, paramName: string): string {
	var i = url.indexOf("?");

	if (i === -1) {
		return "";
	}

	var queryString = "&" + url.substring(i + 1);
	var encodedParamName = encodeURIComponent(paramName);
	var paramNameStart = queryString.indexOf("&" + encodedParamName + "=");

	if (paramNameStart === -1) {
		return "";
	}

	var paramValueStart = paramNameStart + encodedParamName.length + 2;
	var nextSeparatorPos = queryString.indexOf("&", paramValueStart);

	return decodeURIComponent(
		queryString.substring(
			paramValueStart,
			nextSeparatorPos === -1 ? queryString.length : nextSeparatorPos
		)
	);
}

function selectWindowSearchParam(win: Window, paramName: string): string {
	return selectSearchParam(win.location.search, paramName);
}
