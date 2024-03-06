import append from "./append.js";
import bind from "./bind.js";
import {rootComponent, rootInjector} from "./root.js";
import {setComponent, setInjector} from "./contextGuard.js";
import update from "./update.js";
import type {View} from "./view.js";

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
