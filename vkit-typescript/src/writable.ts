import type {ComputedSignal} from "./computed.js";
import {add, toggle, toString, update, type Signal, type WritableSignal} from "./signal.js";

export default function writable<T, U extends T>(
    input: ComputedSignal<T>,
    setValue: (value: U) => void
): WritableSignal<T> {
    var output = input as Signal<T> as WritableSignal<T>;
    output.add = add;
    output.set = setValue;
    output.setEagerly = setValue;
    output.toggle = toggle;
    output.toString = toString;
    output.update = update;
    return output;
}
