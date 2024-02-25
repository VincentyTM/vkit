import effect from "./effect";
import {getComponent} from "./contextGuard";

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
