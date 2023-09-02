import bind from "./bind";
import append from "./append";
import {View} from "./view";

function shadow(...args: View[]): (element: HTMLElement) => void;
function shadow(){
	var args: View = arguments;
	
	return function(element: HTMLElement){
		var shadowRoot = element.shadowRoot || element.attachShadow({mode: "open"});
		append(shadowRoot as Node, args, shadowRoot, bind);
	};
}

export default shadow;
