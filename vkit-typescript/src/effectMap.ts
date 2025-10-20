import { Signal } from "./computed.js";
import { getEffect } from "./contextGuard.js";
import { createEffect, Effect } from "./createEffect.js";
import { destroyEffect } from "./destroyEffect.js";
import { inject } from "./inject.js";
import { objectAssign } from "./objectAssign.js";
import { PERSISTENT_SUBSCRIBERS_FLAG } from "./reactiveNodeFlags.js";
import { RenderConfigService } from "./RenderConfigService.js";
import { signal, WritableSignal } from "./signal.js";
import { subscribe } from "./subscribe.js";
import { updateEffect } from "./updateEffect.js";

export function effectMap<K extends string, T, U, W extends Signal<Record<K, T>>>(
	objectSignal: W,
	mapKey: (key: K, objectSignal: W) => U
): Signal<Record<K, U>>;

export function effectMap<K extends string, T, U, V, W extends Signal<Record<K, T>>>(
	objectSignal: W,
	mapKey: (key: K, objectSignal: W, data: U) => V,
	data: U
): Signal<Record<K, V>>;

export function effectMap<K extends string, T, U, V, W extends Signal<Record<K, T>>>(
	objectSignal: W,
	mapKey: (key: K, objectSignal: W, data?: U) => V,
	data?: U
): Signal<Record<K, V>> {
	var values = signal<Record<string, V>>({});
	
	if (!inject(RenderConfigService).doRunEffects) {
		return values;
	}

	var parentEffect = getEffect();
	var effects: Record<string, Effect> = {};
	var groupEffect = createEffect(parentEffect, parentEffect.injector, function() {
		var object = objectSignal();

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
				subscribe(groupEffect, instanceEffect);
				updateEffect(instanceEffect);
			}
		}
		
		effects = next;
	});
	
	groupEffect.flags |= PERSISTENT_SUBSCRIBERS_FLAG;
	updateEffect(groupEffect);
	
	return values;
}

function createInstanceEffect<K extends string, T, U, V, W extends Signal<Record<K, T>>>(
	parentEffect: Effect,
	values: WritableSignal<Record<K, V>>,
	key: K,
	mapKey: (key: K, objectSignal: W, data: U) => V,
	objectSignal: W,
	data: U
): Effect {
	return createEffect(parentEffect, parentEffect.injector, function(): void {
		var extended = objectAssign({}, values.get());
		extended[key] = mapKey(key, objectSignal, data);
		values.set(extended);
	});
}

function removeKey<T extends object>(object: T, key: keyof T): T {
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
