import htmlTag from "./htmlTag";

import type {View} from "./view";

var htmlTags = new Proxy({} as {[key: string]: (...contents: View[]) => HTMLElement}, {
    get: function(_target, tagName: string, _receiver){
        return htmlTag(tagName.toLowerCase().replace(/_/g, "-"));
    }
});

export default htmlTags;
