import svgTag from "./svgTag";
import {View} from "./view";

type SVGProxy = {
	[key: string]: (...contents: View[]) => Element
};

var svgTags = new Proxy({}, {
    get: function(_target: SVGProxy, tagName: string, _receiver: SVGProxy){
        return svgTag(tagName.toLowerCase().replace(/_/g, "-"));
    }
});

export default svgTags;
