import { createSignalNode } from "./createSignalNode.js";
import { invalidateNode } from "./reactiveNodeStack.js";
import { updateSignalNode } from "./updateSignalNode.js";

export type ArrayOfMaybeSignals<A extends unknown[]> = unknown[] & {
	[I in keyof A]: A[I] | Signal<A[I]>;
};

export interface ComputedSignal<T> extends Signal<T> {
	/**
	 * Marks the computed signal as to be recalculated before the next read.
	 */
	invalidate(): void;
}

export interface Signal<T> {
	(): T;

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
	 * @returns The unsubscribe function. It removes the callback from the signal, so it will
	 * not be called anymore when its value changes.
	 */
	subscribe(callback: (value: T) => void): () => void;

	/**
	 * Returns a string generated from the signal's current value.
	 * This method should only be used for debugging.
	 * Note that you cannot concatenate a signal with a string using the + operator.
	 * @returns A string for debugging purposes.
	 */
	toString(): string;
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
	var node = createSignalNode<ReturnType<F>>(computeValue as never, dependencies);

	function use(): ReturnType<F> {
		return updateSignalNode(node, true);
	}

	use.get = function(): ReturnType<F> {
		return updateSignalNode(node, false);
	};

	use.invalidate = function(): void {
		invalidateNode(node);
	};

	use.isSignal = true;

	use.map = signalMap;

	use.toString = toString;

	return use as ComputedSignal<ReturnType<F>>;
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
