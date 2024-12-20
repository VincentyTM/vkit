import computed from "./computed.js";
import getWindow from "./getWindow.js";
import type { Signal } from "./signal.js";
import onEvent from "./onEvent.js";
import onUnmount from "./onUnmount.js";

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
	
	onUnmount(onEvent(win, "blur", invalidate));
	onUnmount(onEvent(win, "focus", invalidate));
	
	return focused;
}
