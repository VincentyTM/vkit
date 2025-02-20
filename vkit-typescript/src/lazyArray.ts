import { signal, type Signal } from "./signal.js";
import { onUnmount } from "./onUnmount.js";
import { update } from "./update.js";

export function lazyArray<T>(arraySignal: Signal<T[]>, backwards: boolean): Signal<T[]> {
	var optimized = signal<T[]>([]);
	
	arraySignal.effect(function(array) {
		var opt = optimized.get();
		var n = opt.length;
		var m = array.length;
		
		if (m - n <= 3) {
			optimized.set(array);
		} else {
			n += 10;
			optimized.set(backwards ? array.slice(Math.max(0, m - n)) : array.slice(0, n));
			
			var interval = setInterval(function() {
				n += 10;
				
				if (m <= n) {
					clearInterval(interval);
				}
				
				optimized.set(backwards ? array.slice(Math.max(0, m - n)) : array.slice(0, n));
				update();
			}, 1);
			
			onUnmount(function() {
				clearInterval(interval);
			});
		}
	});
	
	return optimized;
}
