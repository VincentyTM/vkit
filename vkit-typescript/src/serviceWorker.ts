import { asyncEffect, AsyncResult } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";

export function serviceWorker(src: string, options?: RegistrationOptions): Signal<AsyncResult<ServiceWorkerRegistration>> {
	var win = getWindow();

	return asyncEffect(function() {
		if (win === null) {
			throw new TypeError("Window is not available");
		}

		var nav = win.navigator;

		if (!(nav.serviceWorker && typeof nav.serviceWorker.register === "function")) {
			throw new TypeError("ServiceWorker API is not supported");
		}

		return nav.serviceWorker.register(src, options);
	});
}
