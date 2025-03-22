import { ComputedSignal, signalMap } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";
import { signalEffect } from "./signalEffect.js";
import { signalText } from "./signalText.js";
import { Template } from "./Template.js";
import { enqueueUpdate } from "./update.js";
import { updateEffect } from "./updateEffect.js";
import { view } from "./view.js";
import { views } from "./views.js";

export type ItemType<T> = T extends (infer ItemType)[] ? ItemType : never;

export type Signal<T> = {
	(): T;

	/**
	 * The parent effect in which the signal was created.
	 * It is null if the signal was created outside the reactivity tree (for example, in an event listener).
	 */
	parentEffect: Effect | null;

	/**
	 * Subscribes a side effect to the signal.
	 * @example
	 * const delay = signal(1000);
	 * 
	 * delay.effect((currentDelay) => {
	 * 	console.log("The delay is", currentDelay);
	 * 
	 * 	const interval = setInterval(() => {
	 * 		console.log("Hello world");
	 * 	}, currentDelay);
	 * 
	 * 	onDestroy(() => clearInterval(interval));
	 * });
	 * 
	 * @param callback A function containing the side effect.
	 * It is called everytime the signal's value changes.
	 * Remember to call onDestroy in it to clean up the side effect.
	 */
	effect(callback: (value: T) => void): void;

	/**
	 * @returns The current value of the signal.
	 */
	get(): T;

	/**
	 * A boolean which is always true. It is used internally to check if a value is a signal.
	 */
	isSignal: true;

	/**
	 * Creates and returns a computed signal whose value depends on the current signal.
	 * This method is useful for chaining signal mappings.
	 * 
	 * @example
	 * const count = signal(4);
	 * const doubleCount = count.map((x: number) => x * 2);
	 * 
	 * // It is essentially the same as:
	 * const doubleCount = computed(() => count() * 2);
	 * 
	 * @param transform Takes the signal's value and returns a new value.
	 * @returns The computed signal which contains the new value.
	 */
	map<U>(transform: (value: T) => U): ComputedSignal<U>;

	/**
	 * Creates and returns a text node with the signal's value in it.
	 * 
	 * When the signal's value changes, so does the text node's value.
	 * You do not need to call this method manually, just put the signal in an element factory call.
	 * @example
	 * function MyComponent() {
	 * 	const count = signal(0);
	 * 	
	 * 	return [
	 * 		// This could also be written as Div(count.render())
	 * 		Div(count),
	 * 		
	 * 		// Even if the text is a top-level node,
	 * 		// there is no need to call .render()
	 * 		count
	 * 	];
	 * }
	 * 
	 * @returns The text node.
	 */
	render(): Text;

	/**
	 * Subscribes a change handler function to the signal and returns a function to unsubscribe.
	 * @example
	 * const count = signal(0);
	 * count.subscribe((value) => console.log(`Count has changed to ${count}`));
	 * count.set(1);
	 * 
	 * @param callback A function which is called when the value of the signal changes.
	 * @param persistent If true, there will be no automatic unsubscription based on the current component.
	 * If you use signals outside components, you might want to set it to true.
	 * Remember to manually unsubscribe in that case.
	 * @returns The unsubscribe function. It removes the callback from the signal, so it will
	 * not be called anymore when its value changes.
	 */
	subscribe(
		callback: (value: T) => void,
		persistent?: boolean
	): () => void;

	/**
	 * Returns a string generated from the signal's current value.
	 * This method should only be used for debugging.
	 * Note that you cannot concatenate a signal with a string using the + operator.
	 * @returns A string for debugging purposes.
	 */
	toString(): string;

	/**
	 * Creates a dynamic view (a part of the DOM) which is rerendered when the value of the signal changes.
	 * Note that other signals may trigger a rerender too.
	 * @example
	 * function MyComponent() {
	 * 	const count = signal(0);
	 * 	
	 * 	return count.view((c) => {
	 * 		return ["Count is: ", c];
	 * 	});
	 * }
	 * 
	 * @param getCurrentView A function that returns the current view.
	 * @returns The initial view.
	 */
	view<ViewT extends Template<ContextT>, ContextT>(getCurrentView: (value: T) => ViewT): Template<ContextT>;

	/**
	 * Creates a dynamic view with a subview for each element in the array contained in the signal.
	 * 
	 * When the value of the signal changes, the items of the old and the new arrays are compared and the changes are reflected in the DOM.
	 * If an item is not removed during the change, its corresponding subview is preserved.
	 * @example
	 * function MyComponent() {
	 * 	const list = signal([
	 * 		{text: "A"},
	 * 		{text: "B"},
	 * 		{text: "C"}
	 * 	]);
	 * 	
	 * 	return Ul(
	 * 		list.views((item) => {
	 * 			return Li(item.text);
	 * 		})
	 * 	);
	 * }
	 * 
	 * @param getItemView The function that returns a subview for an array item.
	 * @returns The initial view containing the subviews for all items in the array.
	 */
	views<ViewT extends Template<ContextT>, ContextT>(getItemView: (value: ItemType<T>) => ViewT): Template<ContextT>;
};

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
	 * Sets the signal's value and immediately notifies its subscribers about the change.
	 * @example
	 * const count = signal(10);
	 * count.subscribe((value) => console.log("The value has changed to: " + value));
	 * count.set(20);
	 * console.log("This will run after the previous console.log.");
	 * 
	 * @param value The new value of the signal.
	 */
	setEagerly(value: T): void;

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
	
	function setEagerly(newValue: T): void {
		if (value !== newValue) {
			value = newValue;
			
			var subs = subscriptions.slice();
			var n = subs.length;
				
			for (var i = 0; i < n; ++i) {
				var sub = subs[i];
				if (sub.callback) {
					sub.callback(value);
				}
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
	use.render = signalText;
	use.set = set;
	use.setEagerly = setEagerly;
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
