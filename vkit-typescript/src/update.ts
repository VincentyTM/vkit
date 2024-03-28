import {callTicks} from "./tick.js";

var queue: (() => void)[] = [];

var queueMt = queueMicrotask || (typeof Promise === "function" && typeof Promise.resolve === "function"
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

export default function update(): void {
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
