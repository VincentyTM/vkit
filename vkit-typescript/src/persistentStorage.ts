import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { noop } from "./noop.js";
import { permission, PermissionPrompt } from "./permission.js";
import { signal } from "./signal.js";

interface PersistentStorage {
	permission: Signal<PermissionPrompt>;
	persisted: Signal<boolean>;
}

export function persistentStorage(): PersistentStorage {
	var win = getWindow();
	
	if (win === null) {
		return {
			permission: computed(function(): PermissionPrompt {
				return {
					state: "default"
				};
			}),
			
			persisted: computed(function(): boolean {
				return false;
			})
		};
	}
	
	var nav = win.navigator;
	
	function requestPermission(grant: () => void, deny: () => void): void {
		if (isSupported) {
			nav.storage.persist().then(function(value) {
				value ? grant() : deny();
				persisted.set(value);
			}, deny);
		}
	}
	
	var isSupported = nav.storage && typeof nav.storage.persist === "function";
	var persisted = signal(false);
	
	if (isSupported && typeof nav.storage.persisted === "function") {
		nav.storage.persisted().then(function(p) {
			persisted.set(p);
		}, noop);
	}
	
	return {
		permission: permission("persistent-storage", requestPermission),
		persisted: persisted
	};
}
