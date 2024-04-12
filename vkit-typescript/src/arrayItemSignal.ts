import type {ComputedSignal} from "./computed.js";
import type {WritableSignal} from "./signal.js";
import writable from "./writable.js";

export default function arrayItemSignal<T>(
    parent: WritableSignal<T[]>,
    item: ComputedSignal<T>
): WritableSignal<T> {
    var current: T = item.get();

    function set(value: T): void {
        if (current === value) {
            return;
        }

        var array = parent.get();

        for (var i = array.length; i--;) {
            if (array[i] === current) {
                parent.set(array.slice(0, i).concat([value], array.slice(i + 1)));
                break;
            }
        }
		
        current = value;
    }

    return writable(item, set);
}
