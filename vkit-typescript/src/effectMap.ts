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

/**
 * Maps each key in a source object to another value within a reactive context.
 * 
 * For each key in the source object, a reactive context is created.
 * If a key is no longer present, its reactive context is destroyed.
 * Note that simply replacing a key's value does not destroy or recreate its reactive context.
 * 
 * Use this function to declare side effects and collect transformed values
 * based on the provided mapping function.
 * 
 * @example
 * function UserContainer() {
 * 	// This signal object specifies which users to load
 * 	const requestedUsers = signal({
 * 		me: true
 * 	});
 * 
 * 	const users = effectMap(requestedUsers, (userId) => {
 * 		const request = computed(() => ({
 * 			responseType: "json",
 * 			url: `/api/users/${userId}`
 * 		}));
 * 		const response = http(request);
 * 
 * 		// Error handling is omitted for simplicity
 * 		return response.map(
 * 			res => res.ok ? res.body : undefined
 * 		);
 * 	});
 * 
 * 	return {
 * 		// This can be called in a reactive context
 * 		// (e.g. computed or effect) and will automatically
 * 		// update it when the user is loaded
 * 		select: (userId) => users()[userId]?.()
 * 	};
 * }
 * 
 * // Create an instance of UserContainer
 * const userContainer = UserContainer();
 * 
 * // Signal that contains undefined or the user object
 * // once it is loaded
 * const myUser = computed(() => userContainer.select("me"));
 * 
 * @param objectSignal The input signal containing the source object.
 * @param mapKey A function that maps each key from the source object to a new value.
 * @returns A signal that contains the output object.
 * The output object retains the same keys as the input object,
 * but its values are calculated by the mapping function.
 */
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
	var groupEffect = createEffect(parentEffect, function() {
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
	return createEffect(parentEffect, function(): void {
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
