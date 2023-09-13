import createComponent from "./component";
import {getComponent, getInjector} from "./contextGuard";
import onUnmount from "./onUnmount";
import {ItemType, Signal} from "./signal";
import signalEffect from "./signalEffect";
import signalPipe from "./signalPipe";
import signalProp from "./signalProp";
import signalText from "./signalText";
import view from "./view";
import views from "./views";

export type ComputedSignal<ValueType> = Signal<ValueType> & {
	update(): void;
};

export type SignalValueType<ValueType> = ValueType extends Signal<unknown> ? ReturnType<ValueType["get"]> : ValueType;
export type SignalValuesType<ArrayType> = {[K in keyof ArrayType]: SignalValueType<ArrayType[K]>};

function computed<GetValueType extends (...args: SignalValuesType<Inputs>) => unknown, Inputs extends any[]>(
	getValue: GetValueType,
	inputs?: Inputs
): ComputedSignal<ReturnType<GetValueType>> {
	type ValueType = ReturnType<GetValueType>;

	var parent = getComponent(true);
	var subscriptions: ((value: ValueType) => void)[] = [];
	var value: ValueType;
	var signalComponent = createComponent(computeValue, parent, getInjector(true));
	
	if (inputs) {
		var n = inputs.length;
		
		for (var i = 0; i < n; ++i) {
			var input = inputs[i];
			
			if (input && typeof input.subscribe === "function") {
				input.subscribe(signalComponent.render);
			}
		}
	}
	
	function computeValue() {
		var newValue: ValueType;
		
		if (inputs) {
			var n = inputs.length;
			var args = new Array<unknown>(n) as SignalValuesType<Inputs>;
			
			for (var i = 0; i < n; ++i) {
				var input = inputs[i];
				args[i] = input && typeof input.get === "function" ? input.get() : input;
			}
			
			newValue = getValue.apply(null, args) as ValueType;
		}else{
			newValue = (getValue as () => ValueType)();
		}
		
		if (value !== newValue) {
			value = newValue;
			
			var n = subscriptions.length;
			
			for(var i = 0; i < n; ++i){
				subscriptions[i](value);
			}
		}
	}
	
	function use() {
		var value = get();
		subscribe(getComponent()!.render);
		return value;
	}
	
	function get() {
		if (value === undefined) {
			signalComponent.render();
		}
		return value;
	}
	
	function subscribe(
		callback: (value: ValueType) => void,
		persistent = false
	) {
		var component = getComponent(true);
		var unmounted = false;
		
		subscriptions.push(function (value) {
			if (!unmounted) {
				callback(value);
			}
		});
		
		function unsubscribe(){
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
	
	use.component = parent;
	use.effect = signalEffect<ValueType>;
	use.get = get;
	use.map = signalMap;
	use.pipe = signalPipe<ValueType, any>;
	use.prop = signalProp<ValueType>;
	use.render = signalText<ValueType>;
	use.subscribe = subscribe;
	use.toString = toString;
	use.update = signalComponent.render;
	use.view = view<ValueType>;
	use.views = views<ItemType<ValueType>>;
	
	return use as unknown as ComputedSignal<ValueType>;
}

export function signalMap<ValueType, TransformType extends (value: ValueType) => unknown>(
	this: Signal<ValueType>,
	transform: TransformType
): ComputedSignal<ReturnType<TransformType>> {
	return computed(transform as (...values: any[]) => ReturnType<TransformType>, [this]);
}

function toString(this: Signal<any>) {
	return "[object ComputedSignal(" + this.get() + ")]";
}

export default computed;
