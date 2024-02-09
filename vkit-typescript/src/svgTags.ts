import svgTag, {SVGAttributes} from "./svgTag";
import {View} from "./view";

type SVGProxy = {
	[K in keyof SVGElementTagNameMap]: (...contents: View<SVGAttributes<SVGElementTagNameMap[K]>>[]) => SVGElementTagNameMap[K];
};

var svgTags = new Proxy<SVGProxy>({} as never, {
	get: function(_target: SVGProxy, tagName: string, _receiver: SVGProxy) {
		return svgTag(tagName.toLowerCase().replace(/_/g, "-") as keyof SVGElementTagNameMap);
	}
});

export default svgTags;
