import append from "./append";
import bind from "./bind";

import type {View} from "./view";

type ItemType = View;
type ContextType = any;

function htmlTag(tagName: string){
	return function(){
		var el = document.createElement(tagName);
		append<ItemType, ContextType>(el, arguments, el, bind);
		return el;
	};
}

export default htmlTag;
