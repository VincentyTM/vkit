interface Pair<K, V> {
	key: K;
	value: V;
}

export interface WeakMapLike<K, V> {
	get(key: K): V | undefined;
	set(key: K, value: V): void;
}

interface WeakMapPolyfill<K, V> extends WeakMapLike<K, V> {
	readonly pairs: Pair<K, V>[];
}

export function createWeakMapPolyfill<K, V>(): WeakMapPolyfill<K, V> {
	return {
		pairs: [],
		get: get,
		set: set
	};
}

function get<K, V>(this: WeakMapPolyfill<K, V>, key: K): V | undefined {
	var pairs = this.pairs;

	for (var i = pairs.length - 1; i >= 0; --i) {
		var pair = pairs[i];
		
		if (pair.key === key) {
			return pair.value;
		}
	}

	return undefined;
}

function set<K, V>(this: WeakMapPolyfill<K, V>, key: K, value: V): void {
	var pairs = this.pairs;

	for (var i = pairs.length - 1; i >= 0; --i) {
		var pair = pairs[i];

		if (pair.key === key) {
			pair.value = value;
			return;
		}
	}

	pairs.push({
		key: key,
		value: value
	});
}
