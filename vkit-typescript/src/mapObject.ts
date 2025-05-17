import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";
import { objectAssign } from "./objectAssign.js";
import { signal, WritableSignal } from "./signal.js";
import { updateEffect } from "./updateEffect.js";

export function mapObject<T, U, V>(
	objectSignal: Record<string, T> | Signal<Record<string, T>> | (() => Record<string, T>),
	mapKey: (key: string, objectSignal: Record<string, T> | Signal<Record<string, T>> | (() => Record<string, T>), data: U) => V,
	data: U
): Signal<Record<string, V>> {
	var parentEffect = getEffect();
	var effects: Record<string, Effect> = {};
	var values = signal<Record<string, V>>({});
	
	function setObject(object: Record<string, T>): void {
		for (var key in effects) {
			if (!(key in object)) {
				destroyEffect(effects[key]);
				values.update(removeKey, key);
			}
		}
		
		var next: Record<string, Effect> = {};
		
		for (var key in object) {
			if (key in effects) {
				next[key] = effects[key];
			} else {
				var instanceEffect = createInstanceEffect(
					parentEffect,
					values,
					key,
					mapKey,
					objectSignal,
					data
				);
				next[key] = instanceEffect;
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
	values: WritableSignal<Record<string, V>>,
	key: K,
	mapKey: (key: K, objectSignal: Record<string, T> | Signal<Record<string, T>> | (() => Record<string, T>), data: U) => V,
	objectSignal: Record<string, T> | Signal<Record<string, T>> | (() => Record<string, T>),
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
