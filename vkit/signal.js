(function($) {

var enqueueUpdate = $.enqueueUpdate;
var getComponent = $.getComponent;
var onUnmount = $.onUnmount;
var signalEffect = $.signalEffect;
var signalMap = $.signalMap;
var signalPipe = $.signalPipe;
var signalProp = $.signalProp;
var signalText = $.signalText;
var view = $.view;
var views = $.views;

function createWritableSignal(value) {
	var parent = getComponent(true);
	var subscriptions = [];
	var enqueued = false;
	
	function use() {
		subscribe(getComponent().render);
		return value;
	}
	
	function get() {
		return value;
	}
	
	function subscribe(callback, persistent) {
		var component = getComponent(true);
		var subscription = {callback: callback};
		
		subscriptions.push(subscription);
		
		function unsubscribe(){
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
	
	function set(newValue) {
		if (value !== newValue) {
			value = newValue;
			
			if (!enqueued) {
				enqueued = true;
				enqueueUpdate(notify);
			}
		}
	}
	
	function setEagerly(newValue) {
		if (value !== newValue) {
			value = newValue;
			
			var subs = subscriptions.slice();
			var n = subs.length;
				
			for (var i = 0; i < n; ++i) {
				var sub = subs[i];
				if (sub.callback) {
					sub.callback(value);
				}
			}
		}
	}
	
	function notify() {
		enqueued = false;
		
		var subs = subscriptions.slice();
		var n = subs.length;
			
		for (var i = 0; i < n; ++i) {
			var sub = subs[i];
			if (sub.callback) {
				sub.callback(value);
			}
		}
	}
	
	function update(map, argument) {
		set(map(value, argument));
	}
	
	use.add = add;
	use.component = parent;
	use.effect = signalEffect;
	use.get = get;
	use.isSignal = true;
	use.map = signalMap;
	use.pipe = signalPipe;
	use.prop = signalProp;
	use.render = signalText;
	use.set = set;
	use.setEagerly = setEagerly;
	use.subscribe = subscribe;
	use.toggle = toggle;
	use.toString = toString;
	use.update = update;
	use.view = view;
	use.views = views;
	
	return use;
}

function add(value) {
	this.set(this.get() + value);
}

function toggle() {
	this.set(!this.get());
}

function toString() {
	return "[object WritableSignal(" + this.get() + ")]";
}

$.signal = createWritableSignal;
$.state = createWritableSignal;

})($);
