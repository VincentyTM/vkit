import { Signal, signalMap } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { onDestroy } from "./onDestroy.js";
import { signalEffect } from "./signalEffect.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { view } from "./view.js";
import { views } from "./views.js";

export type WritableSignal<T> = Signal<T> & {
	/**
	 * Sets the signal's value and enqueues a notification of its subscribers.
	 * @example
	 * const count = signal(10);
	 * count.subscribe((value) => console.log("The value has changed to: " + value));
	 * count.set(20);
	 * // count.get() === 20
	 * console.log("The subscribers have not been notified yet.");
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
	 * @param transform A pure function which takes the old signal value and returns the new one.
	 * Optionally, it can have an extra parameter that has the value of `action`.
	 * @param action An optional parameter that can be used to pass data to `transform`.
	 */
	update<A>(transform: (value: T, action: A) => T, action: A): void;
	update(transform: (state: T) => T): void;
};

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
	type Subscription = {
		callback: ((value: T) => void) | null;
	};

	var parent = getEffect(true);
	var subscriptions: Subscription[] = [];
	var enqueued = false;
	
	function use(): T {
		var effect = getEffect(true);
		
		if (effect) {
			if (effect === parent) {
				throw new Error("A signal cannot be used in the reactive block it was created in");
			}
			
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
		var subscription: Subscription = {callback: callback};
		
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
		
		if (component !== parent && !persistent) {
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
	
	use.parentEffect = parent;
	use.effect = signalEffect;
	use.get = get;
	use.isSignal = true;
	use.map = signalMap;
	use.set = set;
	use.subscribe = subscribe;
	use.toString = signalToString;
	use.update = updateSignal;
	use.view = view;
	use.views = views;
	
	return use as WritableSignal<T>;
}

export function signalToString(this: WritableSignal<unknown>): string {
	return "[object WritableSignal(" + this.get() + ")]";
}

export function updateSignal<T, A>(
	this: WritableSignal<T>,
	transform: (state: T, action?: A) => T,
	action?: A
): void {
	this.set(transform(this.get(), action));
}
