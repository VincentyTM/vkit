import { getEffect, setEffect } from "./contextGuard.js";
import { Effect } from "./createEffect.js";
import { Config } from "./provide.js";

export type Provider<T> = {
	getInstance(): T;
};

export function createProvider<T>(
	createInstance: (config: Config) => T,
	config: Config,
	effect: Effect | undefined
): Provider<T> {
	var instance: T | undefined;
	var instanceCreated = false;

	function getInstance(): T {
		if (instanceCreated) {
			return instance!;
		}

		var previousEffect = getEffect();

		try {
			setEffect(effect);
			instance = createInstance(config);
		} finally {
			setEffect(previousEffect);
		}

		instanceCreated = true;
		return instance;
	}

	return {
		getInstance: getInstance
	};
}
