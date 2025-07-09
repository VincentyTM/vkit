import { Signal } from "./computed.js";
import { deriveSignal } from "./deriveSignal.js";
import { WritableSignal } from "./signal.js";

/**
 * Creates and returns a writable signal that reflects and updates an array item at the given index.
 * @example
 * const fruits = signal(["apple", "banana", "orange"]);
 * const secondFruit = arrayItemSignal(fruits, 1);
 * 
 * secondFruit.set("strawberry");
 * 
 * console.log(fruits.get()); // ["apple", "strawberry", "orange"]
 * 
 * @param parent The signal that contains the array.
 * @param index The index of the array item. It may be a signal if it can change dynamically.
 * @returns A writable signal that contains the array item's current value.
 */
export function arrayItemSignal<T>(parent: WritableSignal<T[]>, index: number | Signal<number>): WritableSignal<T> {
    return deriveSignal(parent, selectValue, updateValue, index);
}

function selectValue<T>(state: T[], index: number): T {
    if (!(index in state)) {
        throw new RangeError("Index " + index + " is out of range");
    }

    return state[index];
}

function updateValue<T>(state: T[], newValue: T, index: number): T[] {
    if (!(index in state)) {
        throw new RangeError("Index " + index + " is out of range");
    }

    if (state[index] === newValue) {
        return state;
    }

    var newState = state.slice();
    newState[index] = newValue;
    return newState;
}
