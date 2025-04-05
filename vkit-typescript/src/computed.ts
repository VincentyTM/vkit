import { getEffect, getInjector } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";
import { signalEffect } from "./signalEffect.js";
import { Template } from "./Template.js";
import { updateEffect } from "./updateEffect.js";
import { view } from "./view.js";
import { views } from "./views.js";

var none = {};

export type ArrayOfMaybeSignals<A extends unknown[]> = unknown[] & {
	[I in keyof A]: A[I] | Signal<A[I]>;
};

export interface ComputedSignal<T> extends Signal<T> {
    /**
     * Marks the computed signal as to be recalculated before the next read.
     */
	invalidate(): void;
}

type ItemType<T> = T extends (infer ItemType)[] ? ItemType : never;

export interface Signal<T> {
	(): T;

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
	 readonly isSignal: true;

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
	view<V extends Template<P>, P>(getCurrentView: (value: T) => V): Template<P>;

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
	views<V extends Template<P>, P>(getItemView: (value: ItemType<T>) => V): Template<P>;
}

/**
 * Creates and returns a computed signal.
 * @example
 * function SomeComponent() {
 * 	const count = signal(4);
 * 	const doubleCount = computed(() => count() * 2);
 * 
 * 	return Div(
 * 		"Double count: ", doubleCount
 * 	);
 * }
 * @param computeValue A function which returns some value.
 * If other signals are called within the function,
 * the computed signal will depend on them, which means that its value will
 * be recalculated when any of its dependencies change.
 * @param dependencies An optional array of values used as `getValue`'s arguments.
 * If some values are signals, their contained value is used instead, and
 * the computed signal subscribes to them, waiting for changes.
 * @returns A computed signal.
 */
export function computed<F extends () => unknown>(
	computeValue: F,
	dependencies?: undefined
): ComputedSignal<ReturnType<F>>;

export function computed<F extends (...args: any[]) => unknown>(
	computeValue: F,
	dependencies: ArrayOfMaybeSignals<Parameters<F>>
): ComputedSignal<ReturnType<F>>;

export function computed<F extends (...args: never[]) => unknown>(
	computeValue: F,
	dependencies?: ArrayOfMaybeSignals<Parameters<F>>
): ComputedSignal<ReturnType<F>> {
	type Subscription = {callback: ((value: Value) => void) | null};
	type Value = ReturnType<F>;

	var parentEffect = getEffect(true);
	var subscriptions: Subscription[] = [];
	var value: Value = none as Value;
	var effectOfSignal = createEffect(parentEffect, getInjector(true), updateHandler);

	function invalidate(): void {
		updateEffect(effectOfSignal);
	}
	
	if (dependencies) {
		var n = dependencies.length as number;
		
		for (var i = 0; i < n; ++i) {
			var input = dependencies[i] as unknown as Signal<Parameters<F>[number]>;
			
			if (input && typeof input.subscribe === "function") {
				input.subscribe(invalidate);
			}
		}
	}
	
	function updateHandler(): void {
		var newValue: Value;
		
		if (dependencies) {
			var n = dependencies.length as number;
			var args = new Array<unknown>(n);
			
			for (var i = 0; i < n; ++i) {
				var input = dependencies[i] as unknown as Signal<Parameters<F>[number]>;
				args[i] = input && typeof input.get === "function" ? input.get() : input;
			}
			
			newValue = computeValue.apply(null, args as never[]) as Value;
		} else {
			newValue = (computeValue as () => Value)();
		}

		var oldValue = value;
		
		if (oldValue === newValue) {
			return;
		}

		value = newValue;

		if (oldValue === none) {
			return;
		}
		
		var subs = subscriptions.slice();
		var m = subs.length;
		
		for (var i = 0; i < m; ++i) {
			var sub = subs[i];
			if (sub.callback) {
				sub.callback(value);
			}
		}
	}
	
	function use(): Value {
		var value = get();
		var effect = getEffect(true);
		
		if (effect) {
			subscribe(function(): void {
				updateEffect(effect!);
			});
		}
		
		return value;
	}
	
	function get(): Value {
		if (value === none) {
			invalidate();
		}
		return value;
	}
	
	function subscribe(
		callback: (value: Value) => void,
		persistent?: boolean
	): () => void {
		var effect = getEffect(true);
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
		
		if (effect !== parentEffect && !persistent) {
			onDestroy(unsubscribe);
		}
		
		return unsubscribe;
	}
	
	use.effect = signalEffect;
	use.get = get;
	use.invalidate = invalidate;
	use.isSignal = true;
	use.map = signalMap;
	use.subscribe = subscribe;
	use.toString = toString;
	use.view = view;
	use.views = views;
	
	return use as ComputedSignal<Value>;
}

export function signalMap<T, M extends (value: T) => unknown>(
	this: Signal<T>,
	transform: M
): ComputedSignal<ReturnType<M>> {
	return computed(transform as (...values: any[]) => ReturnType<M>, [this]);
}

function toString(this: ComputedSignal<unknown>): string {
    return "[object ComputedSignal(" + this.get() + ")]";
}
