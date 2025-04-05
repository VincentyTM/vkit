import { ComputedSignal, Signal } from "./computed.js";
import { updateSignalValue, WritableSignal, writableSignalToString } from "./signal.js";

export function writable<T, U extends T>(
    input: ComputedSignal<T>,
    setValue: (value: U) => void
): WritableSignal<T> {
    var output = input as Signal<T> as WritableSignal<T>;
    output.set = setValue;
    output.toString = writableSignalToString;
    output.update = updateSignalValue;
    return output;
}
