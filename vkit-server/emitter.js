import noop from "./noop.js";

export default function createEmitter(base) {
	function cloneEmitter() {
		return createEmitter(base);
	}

	function pipe() {
		return e;
	}

	var e;

	if (base) {
		function Emitter() {}
		Emitter.prototype = base;
		e = new Emitter();
	} else {
		e = {};
	}
	
	e.async = cloneEmitter;
	e.await = cloneEmitter;
	e.catchError = cloneEmitter;
	e.emit = noop;
	e.map = cloneEmitter;
	e.pipe = pipe;
	e.tap = cloneEmitter;
	e.then = cloneEmitter;
	e.throwError = noop;
	e.when = cloneEmitter;
	return e;
}
