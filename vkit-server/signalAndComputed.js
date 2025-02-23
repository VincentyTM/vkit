import createTextNode from "./createTextNode.js";
import noop from "./noop.js";

var none = {};

function map(transform) {
	return computed(transform, [this]);
}

function pipe(output, transform) {
	var input = this;
	var hasTransform = typeof transform === "function";
	var value = input.get();
	output.set(hasTransform ? transform(value, output.get()) : value);
}

function prop(key) {
	var value = this.get();
	
	return function(element) {
		element[key] = value;
	};
}

function render() {
	return createTextNode(this.get());
}

export function toStringWritable() {
	return "[object WritableSignal(" + this.get() + ")]";
}

function toStringComputed() {
	return "[object ComputedSignal(" + this.get() + ")]";
}

export function update(transform, action) {
	this.set(transform(this.get(), action));
}

function view(getView) {
	return getView(this.get());
}

function views(getView) {
	var items = this.get();
	var n = items.length;
	var array = new Array(n);
	
	for (var i = 0; i < n; ++i) {
		array[i] = getView(items[i], {index: i});
	}
	
	return array;
}

export function computed(getValue, inputs) {
	var value = none;
	
	function get() {
		if (value === none) {
			if (inputs) {
				var n = inputs.length;
				var args = new Array(n);
				
				for (var i = 0; i < n; ++i) {
					var input = inputs[i];
					args[i] = input && typeof input.get === "function" ? input.get() : input;
				}
				
				value = getValue.apply(null, args);
			} else {
				value = getValue();
			}
		}
		
		return value;
	}
	
	function invalidate() {
		value = none;
	}
	
	get.component = null;
	get.effect = noop;
	get.get = get;
	get.invalidate = invalidate;
	get.isSignal = true;
	get.map = map;
	get.pipe = pipe;
	get.prop = prop;
	get.render = render;
	get.subscribe = noop;
	get.toString = toStringComputed;
	get.view = view;
	get.views = views;
	return get;
}

export function signal(value) {
	function get() {
		return value;
	}
	
	function set(v) {
		value = v;
	}
	
	get.component = null;
	get.effect = noop;
	get.get = get;
	get.isSignal = true;
	get.map = map;
	get.pipe = pipe;
	get.prop = prop;
	get.render = render;
	get.set = set;
	get.subscribe = noop;
	get.toString = toStringWritable;
	get.update = update;
	get.view = view;
	get.views = views;
	return get;
}
