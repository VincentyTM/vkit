import append from "./append";
import bind from "./bind";
import {rootComponent, rootProvider} from "./root";
import {setComponent, setProvider} from "./contextGuard";
import update from "./update";

import type {View} from "./view";

function render(getView: () => View, container: Node){
	try{
		setComponent(rootComponent);
		setProvider(rootProvider);
		
		var view = getView();
		
		append(container, view, container, bind);
	}finally{
		setComponent(null);
		setProvider(null);
	}
	
	update();
	
	return rootComponent;
}

export default render;
