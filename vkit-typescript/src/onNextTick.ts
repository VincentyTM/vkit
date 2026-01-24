var ticks: (() => void)[] = [];

/**
 * Schedules a function to run after the current render cycle ends (after DOM updates and side effects).
 * It can be used for focusing, scrolling or measuring elements.
 * It does not need to be called from reactive context, it can also be called from asynchronous functions and event listeners.
 * @example
 * function AutoFocus(el) {
 * 	return onNextTick(() => el.focus());
 * }
 * 
 * function AutoFocusedInput() {
 * 	return Input(AutoFocus);
 * }
 * 
 * @param callback The function that will run when the current render cycle ends.
 */
export function onNextTick(callback: () => void): void {
	ticks.push(callback);
}

export function callTicks(): void {
	var n = ticks.length;

	if (n) {
		var callbacks = ticks;

		ticks = [];

		for (var i = 0; i < n; ++i) {
			callbacks[i]();
		}
	}
}
