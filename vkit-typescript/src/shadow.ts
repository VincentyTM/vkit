import bind from "./bind.js";
import append from "./append.js";
import type {View} from "./view.js";

export default function shadow(...contents: View<ShadowRoot>[]): View<HTMLElement>;

export default function shadow(): View<HTMLElement> {
	var contents: View<ShadowRoot> = arguments;
	
	return function(element: HTMLElement): void {
		var shadowRoot = element.shadowRoot || element.attachShadow({mode: "open"});
		append(shadowRoot, contents, shadowRoot, bind);
	};
}
