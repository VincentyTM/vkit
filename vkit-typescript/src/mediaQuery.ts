import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

/**
 * Returns a signal indicating whether the specified media query matches the current viewport.
 * If the media query is not supported or the function is called from the server,
 * the signal's value is false.
 * 
 * @param query A string representing the CSS media query, excluding `@media`.
 * 
 * @example
 * const isWideScreen = mediaQuery("screen and (min-width: 40em)");
 * 
 * @returns A boolean signal that reflects whether the media query is currently matched.
 */
export function mediaQuery(query: string): Signal<boolean> {
	var win = getWindow();

	if (!win || !win.matchMedia) {
		return computed(getFalse);
	}

	var matcher = win.matchMedia(query);
	var matches = signal(matcher.matches);

	function handleChange(e: MediaQueryListEvent): void {
		matches.set(e.matches);
	}

	if (matcher.addEventListener) {
		matcher.addEventListener("change", handleChange);

		onDestroy(function(): void {
			matcher.removeEventListener("change", handleChange);
		});
	} else {
		matcher.addListener(handleChange);

		onDestroy(function(): void {
			matcher.removeListener(handleChange);
		});
	}

	return matches;
}

function getFalse(): boolean {
	return false;
}
