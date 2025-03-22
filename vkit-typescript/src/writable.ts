import { ComputedSignal } from "./computed.js";
import { signalToString, updateSignal, Signal, WritableSignal } from "./signal.js";

export function writable<T, U extends T>(
    input: ComputedSignal<T>,
    setValue: (value: U) => void
): WritableSignal<T> {
    var output = input as Signal<T> as WritableSignal<T>;
    output.set = setValue;
    output.setEagerly = setValue;
    output.toString = signalToString;
    output.update = updateSignal;
    return output;
}
