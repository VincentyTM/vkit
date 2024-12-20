import {getComponent, setComponent} from "./contextGuard.js";
import type {Component} from "./createComponent.js";
import type {Config} from "./provide.js";

export type Provider<T> = {
	getInstance(): T;
};

export default function createProvider<T>(
	createInstance: (config: Config) => T,
	config: Config,
	component: Component | null
): Provider<T> {
	var instance: T | undefined;
	var instanceCreated = false;

	function getInstance(): T {
		if (instanceCreated) {
			return instance!;
		}

		var previousComponent = getComponent();

		try {
			setComponent(component);
			instance = createInstance(config);
		} finally {
			setComponent(previousComponent);
		}

		instanceCreated = true;
		return instance;
	}

	return {
		getInstance: getInstance
	};
}
