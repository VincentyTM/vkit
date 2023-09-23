(function($, undefined) {

var createComponent = $.component;
var getComponent = $.getComponent;
var getInjector = $.getInjector;
var onUnmount = $.unmount;
var signalEffect = $.signalEffect;
var signalPipe = $.signalPipe;
var signalProp = $.signalProp;
var signalText = $.signalText;
var view = $.view;
var views = $.views;

function createComputedSignal(getValue, inputs) {
	var parent = getComponent(true);
	var subscriptions = [];
	var value;
	var signalComponent = createComponent(computeValue, parent, getInjector(true));
	
	if (inputs) {
		var n = inputs.length;
		
		for (var i = 0; i < n; ++i) {
			var input = inputs[i];
			
			if (input && typeof input.subscribe === "function") {
				input.subscribe(signalComponent.render);
			}
		}
	}
	
	function computeValue() {
		var newValue;
		
		if (inputs) {
			var n = inputs.length;
			var args = new Array(n);
			
			for (var i = 0; i < n; ++i) {
				var input = inputs[i];
				args[i] = input && typeof input.get === "function" ? input.get() : input;
			}
			
			newValue = getValue.apply(null, args);
		}else{
			newValue = getValue();
		}
		
		if (value !== newValue) {
			value = newValue;
			
		var subs = subscriptions.slice();
		var n = subs.length;
		
		for (var i = 0; i < n; ++i) {
			var sub = subs[i];
			if (sub.callback) {
				sub.callback(newValue);
			}
		}
	}
	
	function use() {
		var value = get();
		subscribe(getComponent().render);
		return value;
	}
	
	function get() {
		if (value === undefined) {
			signalComponent.render();
		}
		return value;
	}
	
	function subscribe(callback, persistent) {
		var component = getComponent(true);
		var subscription = {callback: callback};
		
		subscriptions.push(subscription);
		
		function unsubscribe() {
			subscription.callback = null;
			
			for (var i = subscriptions.length; i--;) {
				if (subscriptions[i] === subscription) {
					subscriptions.splice(i, 1);
					break;
				}
			}
		}
		
		if (component !== parent && !persistent) {
			onUnmount(unsubscribe);
		}
		
		return unsubscribe;
	}
	
	use.component = parent;
	use.effect = signalEffect;
	use.get = get;
	use.isSignal = true;
	use.map = signalMap;
	use.pipe = signalPipe;
	use.prop = signalProp;
	use.render = signalText;
	use.subscribe = subscribe;
	use.toString = toString;
	use.update = signalComponent.render;
	use.view = view;
	use.views = views;
	
	return use;
}

function signalMap() {
	var args = arguments;
	var n = args.length;
	
	function transform(value) {
		for(var i=0; i<n; ++i){
			value = args[i](value);
		}
		return value;
	}
	
	return createComputedSignal(n === 1 ? args[0] : transform, [this]);
}

function toString() {
	return "[object ComputedSignal(" + this.get() + ")]";
}

$.computed = createComputedSignal;
$.signalMap = signalMap;

})($);
