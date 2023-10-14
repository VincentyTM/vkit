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
	component: Component | null;
	effect(callback: (value: ValueType) => void): void;
	get(): ValueType;
	isSignal: true;
	map<OutputType>(transform: (value: ValueType) => OutputType): ComputedSignal<OutputType>;
	pipe<OutputType>(
		output: WritableSignal<OutputType>,
		transform?: (value: ValueType) => OutputType
	): void;
	prop(name: string, getValue: () => ValueType): (element: any) => void;
	render(): Text;
	subscribe(
		callback: (value: ValueType) => void,
		persistent?: boolean
	): () => void;
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
	view(getCurrentView: (value: ValueType | null) => View): View;

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
	views(getItemView: (value: ItemType<ValueType>) => View): View;
};

export type WritableSignal<ValueType> = Signal<ValueType> & {
	add(value: ValueType): void;
	set(value: ValueType): void;
	setEagerly(value: ValueType): void;
	toggle(): void;
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
				enqueueUpdate(updateSignal);
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
	
	function updateSignal(): void {
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
	use.effect = signalEffect<ValueType>;
	use.get = get;
	use.isSignal = true;
	use.map = signalMap;
	use.pipe = signalPipe<ValueType, any>;
	use.prop = signalProp<ValueType>;
	use.render = signalText<ValueType>;
	use.set = set;
	use.setEagerly = setEagerly;
	use.subscribe = subscribe;
	use.toggle = toggle;
	use.toString = toString;
	use.view = view<ValueType>;
	use.views = views<ItemType<ValueType>>;
	
	return use as unknown as WritableSignal<ValueType>;
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
