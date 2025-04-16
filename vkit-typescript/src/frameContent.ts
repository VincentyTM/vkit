import { Signal } from "./computed.js";
import { directive } from "./directive.js";
import { isSignal } from "./isSignal.js";
import { onEvent } from "./onEvent.js";
import { render } from "./render.js";
import { Template } from "./Template.js";

export function frameContent(getTemplate: (() => Template<HTMLElement>) | Signal<() => Template<HTMLElement>>): Template<HTMLIFrameElement> {
	var props = {
		onload: function(this: HTMLIFrameElement): void {
			var win = this.contentWindow;

            if (!win) {
                throw new Error("Content window is null");
            }
			
			var root = render(function(): Template<HTMLElement> {
                if (!win) {
                    throw new Error("Content window is null");
                }

				onEvent(win, "unload", function(): void {
					root.destroy();
				});

				return (isSignal(getTemplate) ? getTemplate.get() : getTemplate)();
			}, win.document.body);
		}
	};
	
	if (!isSignal(getTemplate)) {
		return props;
	}
	
	return [
		props,
		
		directive(function(iframe: HTMLIFrameElement): void {
			getTemplate.subscribe(function(): void {
				iframe.src = "";
			});
		})
	];
}
