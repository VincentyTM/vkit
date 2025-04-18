import { computed, Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

interface NavigatorExtension extends Navigator {
	wakeLock: WakeLock;
}

interface WakeLock {
	request(type: "screen"): Promise<WakeLockSentinel>;
}

interface WakeLockSentinel {
	released: boolean;
	onrelease?(): void;
	release(): Promise<void>;
}

function getFalse(): false {
	return false;
}

export function wakeLock(controller?: Signal<boolean> | (() => boolean)): Signal<boolean> {
	var win = getWindow();

	if (!win) {
		return computed(getFalse);
	}

	var navigator = win.navigator as NavigatorExtension;
	var currentSentinel = signal<WakeLockSentinel | null>(null);
	var isPending = false;
	
	function lock(): void {
		if (navigator.wakeLock && !isPending && !currentSentinel.get()) {
			isPending = true;
			
			navigator.wakeLock.request("screen").then(function(sentinel: WakeLockSentinel): void {
				isPending = false;
				
				if (!sentinel.released) {
					sentinel.onrelease = function(): void {
						currentSentinel.set(null);
					};
					
					currentSentinel.set(sentinel);
				}
			}, function(_error: unknown): void {
				isPending = false;
				currentSentinel.set(null);
			});
		}
	}
	
	function unlock(): void {
		var sentinel = currentSentinel.get();
		
		if (sentinel && !isPending) {
			isPending = true;
			
			sentinel.release().then(function(): void {
				isPending = false;
				currentSentinel.set(null);
			}, function() {
				isPending = false;
			});
		}
	}
	
	if (isSignal(controller)) {
		var doLock = computed(Boolean, [controller]);

		effect(function(): void {
			doLock() ? lock() : unlock();
		});
	} else if (typeof controller === "function") {
		var doLock = computed(controller);

		effect(function(): void {
			doLock() ? lock() : unlock();
		});
	} else {
		lock();
	}
	
	onDestroy(unlock);
	
	return currentSentinel.map(Boolean);
}
