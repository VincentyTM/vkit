import { getComponent, setComponent } from "./contextGuard.js";

/**
 * Executes a function outside component context.
 * Signal calls in it are non-reactive which means they do not update the surrounding context when the value of the signal changes.
 * @example
 * const showCountOnConsole = signal(true);
 * const count = signal(0);
 * const logCount = () => console.log("Count is: " + count());
 * 
 * effect(() => {
 * 	if (showCountOnConsole()) {
 * 		// The count is only logged when `showCountOnConsole` changes.
 * 		// It is not logged when `count` changes.
 * 		untracked(logCount);
 * 	}
 * });
 * 
 * @param callback The function that is called once and does not update the current reactive context (computed signal, effect, view, etc.).
 * @returns The return value of the function.
 */
export default function untracked<T>(callback: () => T): T {
	var component = getComponent(true);
	
	if (!component) {
		return callback();
	}
	
	try {
		setComponent(null);
		return callback();
	} finally {
		setComponent(component);
	}
}
