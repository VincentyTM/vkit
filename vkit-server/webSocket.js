import createEmitter from "./emitter.js";
import signal from "./signal.js";

function returnThis() {
	return this;
}

export default function webSocket(url, options) {
	var ws = null;
	var queue = [];
	var isOpen = signal(false);
	
	var emitter = createEmitter({
		socket: ws,
		queue: queue,
		isOpen: isOpen,
		setURL: returnThis,
		open: returnThis,
		close: returnThis,
		send: returnThis
	});
	
	return emitter;
}
