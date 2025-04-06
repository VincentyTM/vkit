import { Signal, signalMap } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { onDestroy } from "./onDestroy.js";
import { signalEffect } from "./signalEffect.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { view } from "./view.js";
import { views } from "./views.js";

interface SignalSubscription<T> {
	callback: ((value: T) => void) | null;
}

export interface WritableSignal<T> extends Signal<T> {
    /**
	 * Sets the signal's value and enqueues a notification for its subscribers.
	 * @example
	 * const count = signal(10);
     * effect(() => console.log("Count:", count())); // Logs 10.
	 * count.set(20);
	 * // count.get() === 20
	 * // 20 has not yet been logged at this point but logging it has been scheduled.
	 * 
	 * @param value The new value of the signal.
	 */
	set(value: T): void;

    /**
	 * Sets the signal's current value to the return value of the callback.
	 * @example
	 * const count = signal(10);
	 * count.update((x) => x * 2);
	 * // count.get() === 20
	 * const toIncrementedBy = (count: number, added: number) => count + added;
	 * count.update(toIncrementedBy, 10);
	 * // count.get() === 30
	 * 
	 * @param reducer A pure function which takes the old signal value and returns the new one.
	 * Optionally, it can have an extra parameter that has the value of `action`.
	 * @param action An optional parameter that can be used to pass data to `reducer`.
	 */
	update<A>(reducer: (state: T, action: A) => T, action: A): void;
	update(reducer: (state: T) => T): void;
}

/**
 * Creates and returns a writable signal.
 * A signal is a container whose value may change over time and it can have
 * multiple subscribers which are notified when the value changes.
 * @example
 * function Counter() {
 * 	const count = signal(0);
 * 	
 * 	return [
 * 		H1("Count: ", count),
 * 		Button("Increment", {
 * 			onclick: () => count.add(1)
 * 		}),
 * 		Button("Reset", {
 * 			disabled: () => count() === 0,
 * 			onclick: () => count.set(0)
 * 		})
 * 	];
 * }
 * @param value The initial value of the signal.
 * @returns A writable signal.
 */
export function signal<T>(value: T): WritableSignal<T> {
	var parentEffect = getEffect(true);
	var subscriptions: SignalSubscription<T>[] = [];
	var enqueued = false;
	
	function use(): T {
		var effect = getEffect(true);
		
		if (effect) {
			subscribe(function(): void {
				updateEffect(effect!);
			});
		}
		
		return value;
	}
	
	function get(): T {
		return value;
	}
	
	function subscribe(
		callback: (value: T) => void,
		persistent?: boolean
	): () => void {
		var component = getEffect(true);
		var subscription: SignalSubscription<T> = {callback: callback};
		
		subscriptions.push(subscription);
		
		function unsubscribe(): void {
			subscription.callback = null;
			
			for (var i = subscriptions.length; i--;) {
				if (subscriptions[i] === subscription) {
					subscriptions.splice(i, 1);
					break;
				}
			}
		}
		
		if (component !== parentEffect && !persistent) {
			onDestroy(unsubscribe);
		}
		
		return unsubscribe;
	}
	
	function set(newValue: T): void {
		if (value !== newValue) {
			value = newValue;
			
			if (!enqueued) {
				enqueued = true;
				enqueueUpdate(notify);
			}
		}
	}
	
	function notify(): void {
		enqueued = false;
		var subs = subscriptions.slice();
		var n = subs.length;
		
		for (var i = 0; i < n; ++i) {
			var sub = subs[i];
			if (sub.callback) {
				sub.callback(value);
			}
		}
	}
	
	use.effect = signalEffect;
	use.get = get;
	use.isSignal = true;
	use.map = signalMap;
	use.set = set;
	use.subscribe = subscribe;
	use.toString = writableSignalToString;
	use.update = updateSignalValue;
	use.view = view;
	use.views = views;
	
	return use as WritableSignal<T>;
}

export function writableSignalToString(this: WritableSignal<unknown>): string {
	return "[object WritableSignal(" + this.get() + ")]";
}

export function updateSignalValue<T, A>(
	this: WritableSignal<T>,
	transform: (state: T, action?: A) => T,
	action?: A
): void {
	this.set(transform(this.get(), action));
}
