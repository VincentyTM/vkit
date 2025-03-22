import { computed } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { Signal } from "./signal.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";

export function isWindowFocused(): Signal<boolean> {
	var win = getWindow();

    if (!win) {
        return computed(function() {
            return false;
        });
    }

	var doc = win.document;
	
	var focused = computed(function() {
		return doc.hasFocus();
	});

    function invalidate(): void {
        focused.invalidate();
    }
	
	onDestroy(onEvent(win, "blur", invalidate));
	onDestroy(onEvent(win, "focus", invalidate));
	
	return focused;
}
