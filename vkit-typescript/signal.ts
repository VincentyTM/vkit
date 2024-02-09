import {enqueueUpdate} from "./update";
import {Component} from "./component";
import {ComputedSignal, signalMap} from "./computed";
import {getComponent} from "./contextGuard";
import onUnmount from "./onUnmount";
import signalEffect from "./signalEffect";
import signalPipe from "./signalPipe";
import signalProp from "./signalProp";
import signalText from "./signalText";
import view, {View} from "./view";
import views from "./views";

export type ItemType<ValueType> = ValueType extends (infer ItemType)[] ? ItemType : never;

export type Signal<ValueType> = {
	(): ValueType;

	/**
	 * The component in which the signal was created.
	 * It is null if the signal was created outside the component tree (for example, in an event listener).
	 */
	component: Component | null;

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
	 * 	onUnmount(() => clearInterval(interval));
	 * });
	 * 
	 * @param callback A function containing the side effect.
	 * It is called everytime the signal's value changes.
	 * Remember to call onUnmount in it to clean up the side effect.
	 */
	effect(callback: (value: ValueType) => void): void;

	/**
	 * @returns The current value of the signal.
	 */
	get(): ValueType;

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
	map<OutputType>(transform: (value: ValueType) => OutputType): ComputedSignal<OutputType>;

	/**
	 * Sets a destination signal's value to the current signal's value immediately and also when the value changes.
	 * 
	 * @example
	 * const firstSignal = signal(1);
	 * const secondSignal = signal(2);
	 * 
	 * firstSignal.pipe(secondSignal, (x: number) => x * 10);
	 * console.log(secondSignal.get()); // 10
	 * 
	 * firstSignal.set(5);
	 * console.log(secondSignal.get()); // 10
	 * 
	 * update();
	 * console.log(secondSignal.get()); // 50
	 * 
	 * @param output The destination signal.
	 * @param transform An optional function that returns a new value.
	 * The destination signal is set to this new value instead of the source state's value.
	 */
	pipe<OutputType>(
		output: WritableSignal<OutputType>,
		transform?: (value: ValueType) => OutputType
	): void;

	/**
	 * Binds a property to the signal.
	 * 
	 * You should use a property binding object instead of this method.
	 * 
	 * @example
	 * function MyComponent() {
	 * 	const bgColor = signal("yellow");
	 * 	const h1Color = signal("red");
	 * 	const h1Title = signal("Some title");
	 * 	
	 * 	// It is not recommended to explicitly write prop:
	 * 	// bgColor.prop(document.body.style, "backgroundColor");
	 * 	bind(document.body, {
	 * 		style: {
	 * 			backgroundColor: bgColor
	 * 		}
	 * 	});
	 * 	
	 * 	// Binding multiple properties of the same element:
	 * 	// (el) => {
	 * 	// 	h1Color.prop(el.style, "color");
	 * 	// 	h1Title.prop(el, "title");
	 * 	// }
	 * 	return H1("Hello world", {
	 * 		style: {
	 * 			color: h1Color
	 * 		},
	 * 		title: h1Title
	 * 	});
	 * }
	 * 
	 * @param name The name of the property.
	 * @returns A function that takes an element and binds its property to the signal.
	 */
	prop(name: string): (element: any) => void;

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
		callback: (value: ValueType) => void,
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
	view<ContextType>(getCurrentView: (value: ValueType) => View<ContextType>): View<ContextType>;

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
	views<ContextType>(getItemView: (value: ItemType<ValueType>) => View<ContextType>): View<ContextType>[];
};

export type WritableSignal<ValueType> = Signal<ValueType> & {
	/**
	 * Adds a value to the the signal's current value.
	 * It behaves the same as `signal.set(signal.get() + value);`.
	 * @example
	 * const count = signal(10);
	 * count.add(20);
	 * // count.get() === 30
	 * 
	 * @param value The new value of the signal.
	 */
	add(value: ValueType): void;
	
	/**
	 * Sets the signal's value and enqueues a notification of its subscribers.
	 * It behaves the same as `signal.set(!signal.get());`.
	 * @example
	 * const count = signal(10);
	 * count.subscribe((value) => console.log("The value has changed to: " + value));
	 * count.set(20);
	 * // count.get() === 20
	 * console.log("The subscribers have not been notified yet.");
	 * 
	 * @param value The new value of the signal.
	 */
	set(value: ValueType): void;
	
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
	setEagerly(value: ValueType): void;

	/**
	 * Negates the signal's current value.
	 * If it is true, it turns into false and vice versa.
	 * @example
	 * const isVisible = signal(false);
	 * count.toggle();
	 * // count.get() === true
	 * count.toggle();
	 * // count.get() === false
	 */
	toggle(): void;

	/**
	 * Sets the signal's current value to the return value of the callback.
	 * @example
	 * const count = signal(10);
	 * count.update((x) => x * 2);
	 * // count.get() === 20
	 * count.update((x, y) => x + y, 10);
	 * // count.get() === 30
	 * 
	 * @param map A function which takes the old signal value and returns the new one.
	 * @param argument An optional argument for `map`.
	 */
	update<ArgumentType>(
		map: (value: ValueType, argument: ArgumentType) => ValueType,
		argument?: ArgumentType
	): void;
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
export default function createWritableSignal<ValueType>(value: ValueType): WritableSignal<ValueType> {
	type Subscription = {callback: ((value: ValueType) => void) | null};

	var parent = getComponent(true);
	var subscriptions: Subscription[] = [];
	var enqueued = false;
	
	function use(): ValueType {
		subscribe(getComponent()!.render);
		return value;
	}
	
	function get(): ValueType {
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
	
	function set(newValue: ValueType): void {
		if (value !== newValue) {
			value = newValue;
			
			if (!enqueued) {
				enqueued = true;
				enqueueUpdate(notify);
			}
		}
	}
	
	function setEagerly(newValue: ValueType): void {
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
	
	use.add = add;
	use.component = parent;
	use.effect = signalEffect;
	use.get = get;
	use.isSignal = true;
	use.map = signalMap;
	use.pipe = signalPipe;
	use.prop = signalProp;
	use.render = signalText;
	use.set = set;
	use.setEagerly = setEagerly;
	use.subscribe = subscribe;
	use.toggle = toggle;
	use.toString = toString;
	use.view = view;
	use.views = views;
	
	return use as WritableSignal<ValueType>;
}

function add<ValueType>(
	this: WritableSignal<ValueType>,
	value: ValueType
): void {
	this.set((this.get() as any) + value);
}

function toggle(this: WritableSignal<boolean>): void {
	this.set(!this.get());
}

function toString(this: WritableSignal<any>): string {
	return "[object WritableSignal(" + this.get() + ")]";
}
