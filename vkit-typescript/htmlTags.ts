import htmlTag from "./htmlTag";
import {View} from "./view";

type HTMLProxy = {
	[K in Capitalize<keyof HTMLElementTagNameMap>]: (...contents: View<HTMLElementTagNameMap[Lowercase<K>]>[]) => HTMLElementTagNameMap[Lowercase<K>];
} & {
	[K: string]: (...contents: View<HTMLElement>[]) => HTMLElement;
};

var htmlTags = new Proxy<HTMLProxy>({} as never, {
	get: function(_target: HTMLProxy, tagName: string, _receiver: HTMLProxy) {
		return htmlTag(tagName.toLowerCase().replace(/_/g, "-") as keyof HTMLElementTagNameMap);
	}
});

export default htmlTags;
