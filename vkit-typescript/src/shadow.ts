import bind from "./bind";
import append from "./append";
import {View} from "./view";

export default function shadow(...args: View[]): (element: HTMLElement) => void;

export default function shadow(): (element: HTMLElement) => void {
	var args: View = arguments;
	
	return function(element: HTMLElement): void {
		var shadowRoot = element.shadowRoot || element.attachShadow({mode: "open"});
		append(shadowRoot as Node, args, shadowRoot, bind);
	};
}
