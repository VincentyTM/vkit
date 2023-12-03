var createEmitter = require("./emitter");
var signal = require("./signal");

function returnThis() {
	return this;
}

function webSocket(url, options) {
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

module.exports = webSocket;
