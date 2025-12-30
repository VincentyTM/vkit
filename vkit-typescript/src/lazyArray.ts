import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

export function lazyArray<T>(arraySignal: Signal<T[]>, backwards: boolean): Signal<T[]> {
	var optimized = signal<T[]>([]);

	effect(function() {
		var array = arraySignal();
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
			}, 1);

			onDestroy(function() {
				clearInterval(interval);
			});
		}
	});

	return optimized;
}
