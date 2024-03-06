import createComponent from "./component.js";
import {getComponent, getInjector} from "./contextGuard.js";
import onUnmount from "./onUnmount.js";
import type {Signal} from "./signal.js";
import signalEffect from "./signalEffect.js";
import signalPipe from "./signalPipe.js";
import signalProp from "./signalProp.js";
import signalText from "./signalText.js";
import view from "./view.js";
import views from "./views.js";

var none = {};

export type ArrayOfMaybeSignals<ArrayType extends ArrayLike<unknown>> = {
	[K in keyof ArrayType]: ArrayType[K] | Signal<ArrayType[K]>;
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
export default function computed<FuncType extends () => unknown>(
	getValue: FuncType,
	dependencies?: undefined
): ComputedSignal<ReturnType<FuncType>>;

export default function computed<FuncType extends (...args: any[]) => unknown>(
	getValue: FuncType,
	dependencies: ArrayOfMaybeSignals<Parameters<FuncType>>
): ComputedSignal<ReturnType<FuncType>>;

export default function computed<FuncType extends (...args: never[]) => unknown>(
	getValue: FuncType,
	dependencies?: ArrayOfMaybeSignals<Parameters<FuncType>>
): ComputedSignal<ReturnType<FuncType>> {
	type Subscription = {callback: ((value: ValueType) => void) | null};
	type ValueType = ReturnType<FuncType>;

	var parent = getComponent(true);
	var subscriptions: Subscription[] = [];
	var value: ValueType = none as ValueType;
	var signalComponent = createComponent(computeValue, parent, getInjector(true));
	var invalidate = signalComponent.render;
	
	if (dependencies) {
		var n = dependencies.length as number;
		
		for (var i = 0; i < n; ++i) {
			var input = dependencies[i] as unknown as Signal<Parameters<FuncType>[number]>;
			
			if (input && typeof input.subscribe === "function") {
				input.subscribe(invalidate);
			}
		}
	}
	
	function computeValue(): void {
		var newValue: ValueType;
		
		if (dependencies) {
			var n = dependencies.length as number;
			var args = new Array<unknown>(n);
			
			for (var i = 0; i < n; ++i) {
				var input = dependencies[i] as unknown as Signal<Parameters<FuncType>[number]>;
				args[i] = input && typeof input.get === "function" ? input.get() : input;
			}
			
			newValue = getValue.apply(null, args as never[]) as ValueType;
		} else {
			newValue = (getValue as () => ValueType)();
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
	
	function use(): ValueType {
		var value = get();
		var component = getComponent(true);
		
		if (component) {
			if (component === parent) {
				throw new Error("A signal cannot be used in the reactive block it was created in");
			}
			
			subscribe(component.render);
		}
		
		return value;
	}
	
	function get(): ValueType {
		if (value === none) {
			invalidate();
		}
		return value;
	}
	
	function subscribe(
		callback: (value: ValueType) => void,
		persistent?: boolean
	): () => void {
		var component = getComponent(true);
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
			onUnmount(unsubscribe);
		}
		
		return unsubscribe;
	}
	
	use.component = parent;
	use.effect = signalEffect;
	use.get = get;
	use.invalidate = invalidate;
	use.isSignal = true;
	use.map = signalMap;
	use.pipe = signalPipe;
	use.prop = signalProp;
	use.render = signalText;
	use.subscribe = subscribe;
	use.toString = toString;
	use.view = view;
	use.views = views;
	
	return use as ComputedSignal<ValueType>;
}

export function signalMap<ValueType, TransformType extends (value: ValueType) => unknown>(
	this: Signal<ValueType>,
	transform: TransformType
): ComputedSignal<ReturnType<TransformType>> {
	return computed(transform as (...values: any[]) => ReturnType<TransformType>, [this]);
}

function toString(this: Signal<any>): string {
	return "[object ComputedSignal(" + this.get() + ")]";
}
