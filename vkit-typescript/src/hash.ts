import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onEvent } from "./onEvent.js";
import { onDestroy } from "./onDestroy.js";

function getEmptyString(): "" {
	return "";
}

function getHash(win: Window): string {
	return decodeURIComponent(win.location.hash.substring(1));
}

/**
 * Creates and returns a read-only signal containing the current URI fragment (hash),
 * without the leading # character. It is dynamically updated during navigation.
 * @example
 * const currentHash = hash();
 * 
 * effect(() => console.log("Current hash:", currentHash()));
 * @returns A signal containing the current URI fragment, or the empty string if
 * there is no window in the current context.
 */
export function hash(): Signal<string> {
	var win = getWindow();
	var hash = win ? computed(getHash, [win]) : computed(getEmptyString);
	
	if (win) {
		onDestroy(onEvent(win, "hashchange", hash.invalidate));
		onDestroy(onEvent(win, "popstate", hash.invalidate));
	}
	
	return hash;
}
