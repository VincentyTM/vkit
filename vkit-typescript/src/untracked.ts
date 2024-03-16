import {getComponent, setComponent} from "./contextGuard.js";

export default function untracked<T>(callback: () => T): T {
	var component = getComponent(true);
	
	if (!component) {
		return callback();
	}
	
	try {
		setComponent(null);
		return callback();
	} finally {
		setComponent(component);
	}
}
