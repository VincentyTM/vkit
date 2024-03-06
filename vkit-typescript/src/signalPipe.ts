import type {Signal, WritableSignal} from "./signal.js";

export default function signalPipe<InputType, OutputType>(
	this: Signal<InputType>,
	output: WritableSignal<OutputType>,
	transform?: (input: InputType, output: OutputType) => OutputType
): void {
	var input = this;
	var hasTransform = typeof transform === "function";
	
	function update(value: InputType) {
		output.set(hasTransform ? transform!(value, output.get()) : value as unknown as OutputType);
	}
	
	input.effect(update);
}
