import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal, WritableSignal } from "./signal.js";

interface StorageOptions {
	onError?(error: unknown): void;
}

export function localStorage(key: string, options?: StorageOptions): WritableSignal<string | null> {
	var win = getWindow();

	if (win === null || win.localStorage === undefined) {
		return signal(null);
	}

	return storage(win, win.localStorage, key, options);
}

export function sessionStorage(key: string, options?: StorageOptions): WritableSignal<string | null> {
	var win = getWindow();

	if (win === null || win.sessionStorage === undefined) {
		return signal(null);
	}

	return storage(win, win.sessionStorage, key, options);
}

function storage(
	win: Window,
	storageArea: Storage,
	key: string,
	options: StorageOptions | undefined
): WritableSignal<string | null> {
	var value = signal(storageArea.getItem(key));
	var set = value.set;
	
	onDestroy(
		onEvent(win, "storage", function(event) {
			var e = event as StorageEvent;

			if (e.storageArea === storageArea && e.key === key) {
				isInternallySet = true;
				set(e.newValue);
			}
		})
	);

	var isInternallySet = true;
	var onError = options && options.onError;

	value.set = function(newValue: string | null): void {
		isInternallySet = false;
		set(newValue);
	};

	effect(function() {
		var v = value();

		if (isInternallySet) {
			return;
		}

		try {
			if (v === null) {
				storageArea.removeItem(key);
			} else {
				storageArea.setItem(key, v);
			}

			var event = new StorageEvent("storage", {
				key: key,
				newValue: v,
				storageArea: storageArea
			});
			
			win.dispatchEvent(event);
		} catch (error) {
			if (onError) {
				onError(error);
			} else {
				throw error;
			}
		}
	});

	return value;
}
