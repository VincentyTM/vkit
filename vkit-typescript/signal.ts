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
	view(getView: (value: ValueType | null) => View): View;
	views(getView: (value: ItemType<ValueType>) => View): View;
};

export type WritableSignal<ValueType> = Signal<ValueType> & {
	add(value: ValueType): void;
	set(value: ValueType): void;
	toggle(): void;
};

function createWritableSignal<ValueType>(value: ValueType): WritableSignal<ValueType> {
	var parent = getComponent(true);
	var subscriptions: ((value: ValueType) => void)[] = [];
	var enqueued = false;
	
	function use() {
		subscribe(getComponent()!.render);
		return value;
	}
	
	function get() {
		return value;
	}
	
	function subscribe(
		callback: (value: ValueType) => void,
		persistent = false
	) {
		var component = getComponent(true);
		var unmounted = false;
		
		subscriptions.push(function(value) {
			if (!unmounted) {
				callback(value);
			}
		});
		
		function unsubscribe() {
			unmounted = true;
			
			for (var i = subscriptions.length; i--;) {
				if (subscriptions[i] === callback) {
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
	
	function set(newValue: ValueType) {
		if (value !== newValue) {
			value = newValue;
			
			if (!enqueued) {
				enqueued = true;
				enqueueUpdate(updateSignal);
			}
		}
	}
	
	function updateSignal() {
		enqueued = false;
		var n = subscriptions.length;
		
		for (var i = 0; i < n; ++i) {
			subscriptions[i](value);
		}
	}
	
	use.add = add;
	use.component = parent;
	use.effect = signalEffect<ValueType>;
	use.get = get;
	use.map = signalMap;
	use.pipe = signalPipe<ValueType, any>;
	use.prop = signalProp<ValueType>;
	use.render = signalText<ValueType>;
	use.set = set;
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
) {
	this.set((this.get() as any) + value);
}

function toggle(this: WritableSignal<boolean>) {
	this.set(!this.get());
}

function toString(this: WritableSignal<any>) {
	return "[object WritableSignal(" + this.get() + ")]";
}

export default createWritableSignal;
