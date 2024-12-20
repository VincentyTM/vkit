import type {ComputedSignal} from "./computed.js";
import {addToSignal, toggleSignal, signalToString, updateSignal, type Signal, type WritableSignal} from "./signal.js";

export default function writable<T, U extends T>(
    input: ComputedSignal<T>,
    setValue: (value: U) => void
): WritableSignal<T> {
    var output = input as Signal<T> as WritableSignal<T>;
    output.add = addToSignal;
    output.set = setValue;
    output.setEagerly = setValue;
    output.toggle = toggleSignal;
    output.toString = signalToString;
    output.update = updateSignal;
    return output;
}
