var ticks: (() => void)[] = [];

/**
 * Schedules a function to execute after the current update cycle completes,
 * ensuring that all side effects, such as DOM rendering, have finished.
 * 
 * This method is particularly useful for tasks involving focusing on elements,
 * scrolling, or measuring dimensions after rendering.
 * It can be invoked from any context, not just reactive environments.
 * 
 * @example
 * // Automatically focuses an element after the DOM has updated.
 * function AutoFocus() {
 * 	return directive(el => {
 * 		onNextTick(() => el.focus());
 * 	});
 * }
 * 
 * // An input component that applies the AutoFocus directive.
 * function AutoFocusedInput() {
 * 	return Input(AutoFocus());
 * }
 * 
 * @param callback The function to execute once the current render cycle ends.
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
