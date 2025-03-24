import { computed } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { Signal } from "./signal.js";

function getTrue(): true {
	return true;
}

export function online(): Signal<boolean> {
	var win = getWindow();

	if (!win) {
		return computed(getTrue);
	}

	var nav = win.navigator;

	var value = computed(function(): boolean {
		return nav.onLine !== false;
	});

	function invalidate(): void {
		value.invalidate();
	}
	
	onDestroy(onEvent(win, "online", invalidate));
	onDestroy(onEvent(win, "offline", invalidate));
	
	return value;
}
