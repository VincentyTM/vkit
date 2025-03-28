import { getEffect, getInjector } from "./contextGuard.js";
import { createEffect } from "./createEffect.js";
import { onDestroy } from "./onDestroy.js";
import { Signal } from "./signal.js";
import { signalEffect } from "./signalEffect.js";
import { updateEffect } from "./updateEffect.js";
import { view } from "./view.js";
import { views } from "./views.js";

var none = {};

export type ArrayOfMaybeSignals<ArrayType extends unknown[]> = unknown[] & {
	[I in keyof ArrayType]: ArrayType[I] | Signal<ArrayType[I]>;
};

export type ComputedSignal<ValueType> = Signal<ValueType> & {
	invalidate(): void;
};

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
 * @param getValue A function which returns some value.
 * If other signals are called within the function,
 * the computed signal will depend on them, which means that its value will
 * be recalculated when any of its dependencies change.
 * @param dependencies An optional array of values used as `getValue`'s arguments.
 * If some values are signals, their contained value is used instead, and
 * the computed signal subscribes to them, waiting for changes.
 * @returns A computed signal.
 */
export function computed<F extends () => unknown>(
	getValue: F,
	dependencies?: undefined
): ComputedSignal<ReturnType<F>>;

export function computed<F extends (...args: any[]) => unknown>(
	getValue: F,
	dependencies: ArrayOfMaybeSignals<Parameters<F>>
): ComputedSignal<ReturnType<F>>;

export function computed<F extends (...args: never[]) => unknown>(
	getValue: F,
	dependencies?: ArrayOfMaybeSignals<Parameters<F>>
): ComputedSignal<ReturnType<F>> {
	type Subscription = {callback: ((value: Value) => void) | null};
	type Value = ReturnType<F>;

	var parent = getEffect(true);
	var subscriptions: Subscription[] = [];
	var value: Value = none as Value;
	var effectOfSignal = createEffect(parent, getInjector(true), computeValue);

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
	
	function computeValue(): void {
		var newValue: Value;
		
		if (dependencies) {
			var n = dependencies.length as number;
			var args = new Array<unknown>(n);
			
			for (var i = 0; i < n; ++i) {
				var input = dependencies[i] as unknown as Signal<Parameters<F>[number]>;
				args[i] = input && typeof input.get === "function" ? input.get() : input;
			}
			
			newValue = getValue.apply(null, args as never[]) as Value;
		} else {
			newValue = (getValue as () => Value)();
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
			if (effect === parent) {
				throw new Error("A signal cannot be used in the reactive block it was created in");
			}
			
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
		
		if (effect !== parent && !persistent) {
			onDestroy(unsubscribe);
		}
		
		return unsubscribe;
	}
	
	use.parentEffect = parent;
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

function toString(this: Signal<any>): string {
	return "[object ComputedSignal(" + this.get() + ")]";
}
