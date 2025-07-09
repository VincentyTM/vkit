import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";
import { objectAssign } from "./objectAssign.js";
import { signal, WritableSignal } from "./signal.js";
import { updateEffect } from "./updateEffect.js";

export function mapObject<K extends string, T, U>(
	objectSignal: Signal<Record<K, T>>,
	mapKey: (key: K, objectSignal: Signal<Record<K, T>>) => U
): Signal<Record<K, U>>;

export function mapObject<K extends string, T, U, V>(
	objectSignal: Signal<Record<K, T>>,
	mapKey: (key: K, objectSignal: Signal<Record<K, T>>, data: U) => V,
	data: U
): Signal<Record<K, V>>;

export function mapObject<K extends string, T, U, V>(
	objectSignal: Signal<Record<K, T>>,
	mapKey: (key: K, objectSignal: Signal<Record<K, T>>, data?: U) => V,
	data?: U
): Signal<Record<K, V>> {
	var parentEffect = getEffect();
	var effects: Record<string, Effect> = {};
	var values = signal<Record<string, V>>({});
	
	function setObject(object: Record<K, T>): void {
		for (var key in effects) {
			if (!(key in object)) {
				destroyEffect(effects[key]);
				values.update(removeKey, key);
			}
		}
		
		var next: Record<string, Effect> = {};
		
		for (var key2 in object) {
			if (key2 in effects) {
				next[key2] = effects[key2];
			} else {
				var instanceEffect = createInstanceEffect(
					parentEffect,
					values,
					key2,
					mapKey,
					objectSignal,
					data
				);
				next[key2] = instanceEffect;
				updateEffect(instanceEffect);
			}
		}
		
		effects = next;
	}
	
	if (isSignal(objectSignal) || typeof objectSignal === "function") {
		effect(function() {
			setObject(objectSignal());
		});
	} else {
		setObject(objectSignal);
	}
	
	return values;
}

function createInstanceEffect<K extends string, T, U, V>(
	parentEffect: Effect,
	values: WritableSignal<Record<K, V>>,
	key: K,
	mapKey: (key: K, objectSignal: Signal<Record<K, T>>, data: U) => V,
	objectSignal: Signal<Record<K, T>>,
	data: U
): Effect {
	return createEffect(parentEffect, parentEffect.injector, function(): void {
		var extended = objectAssign({}, values.get());
		extended[key] = mapKey(key, objectSignal, data);
		values.set(extended);
	});
}

function removeKey<T>(object: T, key: keyof T): T {
	if (!(key in object)) {
		return object;
	}
	
	var newObject: Partial<T> = {};
	
	for (var k in object) {
		if (k !== key) {
			newObject[k] = object[k];
		}
	}
	
	return newObject as T;
}
