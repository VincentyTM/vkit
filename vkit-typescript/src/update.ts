import { callTicks } from "./tick.js";

var queue: (() => void)[] = [];

var queueMt = typeof queueMicrotask === "function" ? queueMicrotask : (typeof Promise === "function" && typeof Promise.resolve === "function"
	? function(callback: () => void) { Promise.resolve().then(callback); }
	: function(callback: () => void) { setTimeout(callback, 0); }
);

export function enqueueUpdate(callback: () => void): void {
	if (queue.push(callback) === 1) {
		queueMt(update);
	}
}

export function dequeueUpdate(callback: () => void): void {
	for (var i = queue.length; i--;) {
		if (queue[i] === callback) {
			queue.splice(i, 1);
			break;
		}
	}
}

/**
 * Synchronizes signal changes immediately with
 * side effects and views and clears the update queue.
 * @example
 * const count = signal(0);
 * effect(() => console.log("Count:", count())); // Prints 0
 * count.set(1);
 * update(); // Prints 1
 */
export function update(): void {
	var n: number;
	
	while (n = queue.length) {
		var updates = queue;
		queue = [];
		
		for (var i = 0; i < n; ++i) {
			updates[i]();
		}
	}
	
	callTicks();
}
