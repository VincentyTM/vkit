import svgTag, { type SVGView } from "./svgTag.js";

type SVGProxy = {
	[K in keyof SVGElementTagNameMap]: (...contents: SVGView<SVGElementTagNameMap[K]>[]) => SVGElementTagNameMap[K];
};

/**
 * Contains all SVG tags (element factories).
 * SVG element names are converted to lower case.
 * In case you want to avoid using proxies or lower case conversion, see `svgTag`.
 * @example
 * const {Svg, Circle} = svgTags;
 * 
 * function Component() {
 * 	return Svg(
 * 		{
 * 			width: 100,
 * 			height: 100,
 * 			viewBox: "0 0 100 100"
 * 		},
 * 
 * 		Circle({
 * 			cx: 50,
 * 			cy: 50,
 * 			r: 50,
 * 			fill: "#ff0000"
 * 		})
 * 	);
 * }
 */
var svgTags = new Proxy<SVGProxy>({} as never, {
	get: function(_target: SVGProxy, tagName: string, _receiver: SVGProxy) {
		return svgTag(tagName.toLowerCase().replace(/_/g, "-") as keyof SVGElementTagNameMap);
	}
});

export default svgTags;
