import tick from "./tick.js";
import type {WritableSignal} from "./signal.js";
import type {View} from "./view.js";

export default function bindSelect(signal: WritableSignal<string>): View<HTMLSelectElement> {
	return [
		function(el) {
			tick(function() {
				el.value = signal.get();
			});
		},
		
		{
			value: signal,
			onchange: function() {
				signal.set((this as HTMLSelectElement).value);
			}
		}
	];
}
