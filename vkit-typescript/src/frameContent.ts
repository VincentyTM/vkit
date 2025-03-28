import { Signal } from "./computed.js";
import { directive } from "./directive.js";
import { get } from "./get.js";
import { isSignal } from "./isSignal.js";
import { onEvent } from "./onEvent.js";
import { renderDetached } from "./renderDetached.js";
import { Template } from "./Template.js";

export function frameContent(getView: (() => Template<HTMLBodyElement>) | Signal<() => Template<HTMLBodyElement>>): Template<HTMLIFrameElement> {
	var props = {
		onload: function(this: HTMLIFrameElement): void {
			var win = this.contentWindow;

            if (!win) {
                throw new Error("Content window is null");
            }
			
			renderDetached(function(unmount: () => void): Template<HTMLBodyElement> {
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
		
		directive(function(iframe: HTMLIFrameElement): void {
			getView.subscribe(function(): void {
				iframe.src = "";
			});
		})
	];
}
