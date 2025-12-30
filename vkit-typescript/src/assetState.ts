import { AssetRefs } from "./assets.js";
import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

export function assetState<T>(
	refs: AssetRefs<T>,
	assetName: string | Signal<string> | (() => string),
	defaultValue: T
): Signal<T> {
	var state = signal(defaultValue);

	function setAssetName(name: string): void {
		if (!name && name !== "") {
			state.set(defaultValue);
			return;
		}

		var asset = refs.add(name);
		state.set(asset.isFulfilled() ? asset.get()! : defaultValue);

		var removeLoadHandler = asset.onLoad(function(value): void {
			state.set(value);
		});

		var removeResetHandler = asset.onReset(function(): void {
			state.set(defaultValue);
		});

		onDestroy(function(): void {
			removeLoadHandler();
			removeResetHandler();
			refs.remove(name);
		});
	}

	if (isSignal(assetName) || typeof assetName === "function") {
		effect(function(): void {
			setAssetName(assetName());
		});
	} else {
		setAssetName(assetName);
	}

	return state;
}
