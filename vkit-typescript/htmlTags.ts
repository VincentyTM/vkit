import htmlTag from "./htmlTag";
import {View} from "./view";

type HTMLProxy = {
	[key: string]: (...contents: View[]) => HTMLElement
};

var htmlTags = new Proxy({}, {
	get: function(_target: HTMLProxy, tagName: string, _receiver: HTMLProxy) {
		return htmlTag(tagName.toLowerCase().replace(/_/g, "-") as keyof HTMLElementTagNameMap);
	}
});

export default htmlTags;
