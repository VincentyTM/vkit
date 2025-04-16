import { Signal } from "./computed.js";
import { directive } from "./directive.js";
import { isSignal } from "./isSignal.js";
import { onEvent } from "./onEvent.js";
import { render } from "./render.js";
import { Template } from "./Template.js";

/**
 * Creates and returns a template which can be used to render content in an iframe.
 * Note that the window in this context (available with `getWindow()`) is the iframe's own window.
 * When the iframe's window is unloaded, its contents - including side effects - are destroyed.
 * @example
 * Iframe(
 * 	frameContent(() => "Hello world")
 * )
 * @param getTemplate A function that returns a template to be rendered within the iframe.
 * The function may be wrapped in a signal. In that case, whenever the signal's value changes,
 * the iframe's contents are re-rendered.
 * @returns A template that can only be used in an iframe element.
 * It is not rendered on the server.
 */
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
