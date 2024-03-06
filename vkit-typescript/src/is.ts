import effect from "./effect.js";
import {getComponent} from "./contextGuard.js";

export default function is(condition: () => boolean): boolean {
	var parent = getComponent();
	var value: boolean | undefined;
	
	effect(function() {
		var oldValue = value;
		value = condition();
		
		if (oldValue !== value && oldValue !== undefined) {
			parent.render();
		}
	});
	
	return value as boolean;
}
