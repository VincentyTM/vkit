import append from "./append";
import bind from "./bind";
import {rootComponent, rootInjector} from "./root";
import {setComponent, setInjector} from "./contextGuard";
import update from "./update";
import {View} from "./view";

export default function render(getView: () => View, container: Node) {
	try {
		setComponent(rootComponent);
		setInjector(rootInjector);
		
		var view = getView();
		
		append(container, view, container, bind);
	} finally {
		setComponent(null);
		setInjector(null);
	}
	
	update();
	return rootComponent;
}
