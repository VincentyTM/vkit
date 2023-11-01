var createTextNode = require("./createTextNode");
var noop = require("./noop");

function map() {
	var args = arguments;
	var n = args.length;
	
	function transform(value) {
		for (var i = 0; i < n; ++i) {
			value = args[i](value);
		}
		
		return value;
	}
	
	return createComputedSignal(n === 1 ? args[0] : transform, [this]);
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

function toStringWritable() {
	return "[object WritableSignal(" + this.get() + ")]";
}

function toStringComputed() {
	return "[object ComputedSignal(" + this.get() + ")]";
}

function view(getView) {
	return getView(this.get());
}

function views(getView) {
	var items = this.get();
	var n = items.length;
	var array = new Array(n);
	
	for (var i = 0; i < n; ++i) {
		array[i] = getView(items[i]);
	}
	
	return array;
}

function createComputedSignal(getValue, inputs) {
	var value;
	
	function get() {
		if (value === undefined) {
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
	
	get.component = null;
	get.effect = noop;
	get.get = get;
	get.map = map;
	get.pipe = pipe;
	get.prop = prop;
	get.render = render;
	get.subscribe = noop;
	get.toString = toStringComputed;
	get.update = noop;
	get.view = view;
	get.views = views;
	
	return get;
}

function createWritableSignal(value) {
	function add(v) {
		value += v;
	}
	
	function get() {
		return value;
	}
	
	function set(v) {
		value = v;
	}
	
	function toggle() {
		value = !value;
	}
	
	get.add = add;
	get.component = null;
	get.effect = noop;
	get.get = get;
	get.map = map;
	get.pipe = pipe;
	get.prop = prop;
	get.render = render;
	get.set = set;
	get.subscribe = noop;
	get.toggle = toggle;
	get.toString = toStringWritable;
	get.update = noop;
	get.view = view;
	get.views = views;
	
	return get;
}

module.exports = {
	computed: createComputedSignal,
	writable: createWritableSignal
};
