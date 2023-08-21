import component from "./component";
import {provider} from "./inject";

function mount(){
	throw new Error("The root component cannot be rerendered");
}

var rootProvider = provider(null, null);
var rootComponent = component(mount, null, rootProvider);

rootProvider.component = rootComponent;

export {rootComponent, rootProvider};
