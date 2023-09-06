import svgTag from "./svgTag";

import type {View} from "./view";

var svgTags = new Proxy({} as {[key: string]: (...contents: View[]) => Element}, {
    get: function(_target: object, tagName: string, _receiver: object){
        return svgTag(tagName.toLowerCase().replace(/_/g, "-"));
    }
});

export default svgTags;
