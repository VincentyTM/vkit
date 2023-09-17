import computed, {ComputedSignal} from "./computed";
import {Signal} from "./signal";
import {View} from "./view";

type KeyedSignal<ValueType> = ComputedSignal<ValueType> & {
	key: string | Signal<string>
};

type Store<ValueType> = {
	keys: string[],
	records: {
		[key: string]: ValueType
	}
};

function getKeys<ValueType>(result: Store<ValueType>) {
	return result.keys;
}

function getRecords<ValueType>(result: Store<ValueType>) {
	return result.records;
}

export default function useKey<ValueType>(
	arraySignal: Signal<ValueType[]>,
	getKey: string | ((value: ValueType) => string)
) {
	var isFunction = typeof getKey === "function";
	
	var signal = computed(function(array) {
		var records: {[key: string]: unknown} = {};
		var n = array ? array.length : 0;
		var keys = new Array(n);
		
		for (var i = 0; i < n; ++i) {
			var value = array[i];
			var key = isFunction ? (getKey as (value: ValueType) => string)(value) : value[getKey as string];
			
			if (key in records) {
				throw new TypeError("Key '" + key + "' is not unique");
			}
			
			records[key] = value;
			keys[i] = key;
		}
		
		return {
			keys: keys,
			records: records
		};
	}, [arraySignal]);
	
	var keysSignal = computed(getKeys, [signal]);
	
	function select(key: string | Signal<string>) {
		var selected = computed(function() {
			var k = key && typeof (key as Signal<string>).get === "function" ? (key as Signal<string>).get() : (key as string);
			return signal.get().records[k];
		}) as unknown as KeyedSignal<ValueType>;
		
		if (key && typeof (key as Signal<string>).subscribe === "function") {
			(key as Signal<string>).subscribe(selected.update);
		}
		
		signal.subscribe(selected.update);
		selected.key = key;
		return selected;
	}
	
	function views(getView: (item: KeyedSignal<ValueType>) => View) {
		return keysSignal.views(function(key) {
			return getView(select(key));
		});
	}
	
	function getItem(key: string) {
		return signal.get().records[key];
	}
	
	return {
		array: arraySignal,
		getItem: getItem,
		records: signal.map(getRecords),
		select: select,
		views: views
	};
}
