import objectAssign from "./objectAssign.js";
import type {WritableSignal} from "./signal.js";
import writable from "./writable.js";

export default function propertySignal<P, K extends keyof P>(
    parent: WritableSignal<P>,
    key: K,
    defaultValue: Exclude<P[K], undefined>
): WritableSignal<Exclude<P[K], undefined>>;

export default function propertySignal<P, K extends keyof P>(
    parent: WritableSignal<P>,
    key: K
): WritableSignal<P[K]>;

export default function propertySignal<P, K extends keyof P>(
    parent: WritableSignal<P>,
    key: K,
    defaultValue?: P[K]
): WritableSignal<P[K] | undefined> {
    function selectValue(state: P): P[K] | undefined {
        var current = state[key];
        return current === undefined ? defaultValue : current;
    }

    function set(value: P[K]): void {
        var oldState = parent.get();
        var current = selectValue(oldState);

        if (current !== value) {
            var newState = objectAssign({}, oldState);
            newState[key] = value;
            parent.set(newState);
        }
    }

    var result = parent.map(selectValue);
    return writable(result, set);
}
