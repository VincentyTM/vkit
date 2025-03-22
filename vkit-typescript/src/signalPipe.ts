import { Signal, WritableSignal } from "./signal.js";

export function signalPipe<I, O>(
	this: Signal<I>,
	output: WritableSignal<O>,
	transform?: (input: I, output: O) => O
): void {
	var input = this;
	var hasTransform = typeof transform === "function";
	
	function update(value: I) {
		output.set(hasTransform ? transform!(value, output.get()) : value as unknown as O);
	}
	
	input.effect(update);
}
