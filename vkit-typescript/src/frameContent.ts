import { get } from "./get.js";
import { isSignal } from "./isSignal.js";
import { onEvent } from "./onEvent.js";
import { renderDetached } from "./renderDetached.js";
import type { Signal } from "./signal.js";
import type { View } from "./view.js";

export function frameContent(getView: (() => View<HTMLBodyElement>) | Signal<() => View<HTMLBodyElement>>): View<HTMLIFrameElement> {
	var props = {
		onload: function(this: HTMLIFrameElement): void {
			var win = this.contentWindow;

            if (!win) {
                throw new Error("Content window is null");
            }
			
			renderDetached(function(unmount: () => void): View<HTMLBodyElement> {
                if (!win) {
                    throw new Error("Content window is null");
                }

				onEvent(win, "unload", unmount);
				return get(getView)();
			}, win.document.body as HTMLBodyElement);
		}
	};
	
	if (!isSignal(getView)) {
		return props;
	}
	
	return [
		props,
		
		function(iframe: HTMLIFrameElement): void {
			getView.subscribe(function(): void {
				iframe.src = "";
			});
		}
	];
}
