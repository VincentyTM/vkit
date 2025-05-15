import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { inject } from "./inject.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { RenderConfigService } from "./RenderConfigService.js";

function selectRequestPath(url: string): string {
    var i = url.indexOf("?");
    return i === -1 ? url : url.substring(0, i);
}

function selectPath(win: Window): string {
    return win.location.pathname;
}

/**
 * Creates and returns a signal containing the current URL path.
 * @returns A read-only signal with the location path.
 */
export function path(): Signal<string> {
	var win = getWindow();

	if (win) {
		var path = computed(selectPath, [win]);

		onDestroy(onEvent(win, "popstate", function(): void {
            path.invalidate();
        }));

        return path;
	}

    var request = inject(RenderConfigService).request;
    return computed(selectRequestPath, [request && request.url || ""]);
}
