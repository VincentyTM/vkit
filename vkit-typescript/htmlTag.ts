import append from "./append";
import bind from "./bind";
import {View} from "./view";

export default function htmlTag<K extends keyof HTMLElementTagNameMap>(tagName: K): (
	...contents: View<HTMLElementTagNameMap[K]>[]
) => HTMLElementTagNameMap[K] {
	return function(): HTMLElementTagNameMap[K] {
		var el = document.createElement(tagName);
		append<View<typeof el>, typeof el>(el, arguments, el, bind);
		return el;
	};
}
