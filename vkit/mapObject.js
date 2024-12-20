(function($) {

var createComponent = $.createComponent;
var effect = $.effect;
var emitUnmount = $.emitUnmount;
var getComponent = $.getComponent;
var getInjector = $.getInjector;
var isSignal = $.isSignal;
var objectAssign = $.objectAssign;
var readOnly = $.readOnly;
var signal = $.signal;

function mapObject(objectSignal, mapKey, data) {
	var parent = getComponent();
	var injector = getInjector();
	var components = {};
	var values = signal({});
	
	function setObject(object) {
		for (var key in components) {
			if(!(key in object)) {
				emitUnmount(components[key]);
				values.update(removeKey, key);
			}
		}
		
		var next = {};
		
		for (var key in object) {
			if (key in components) {
				next[key] = components[key];
			} else {
				var mount = getMount(values, key, mapKey, objectSignal, data);
				var component = createComponent(mount, parent, injector);
				next[key] = component;
				component.render();
			}
		}
		
		components = next;
	}
	
	if (isSignal(objectSignal)) {
		setObject(objectSignal.get());
		objectSignal.subscribe(setObject);
	} else if (typeof objectSignal === "function") {
		effect(function() {
			setObject(objectSignal());
		});
	} else {
		setObject(objectSignal);
	}
	
	return readOnly(values);
}

function getMount(values, key, mapKey, objectSignal, data) {
	return function() {
		var extended = objectAssign({}, values.get());
		extended[key] = mapKey(key, objectSignal, data);
		values.set(extended);
	};
}

function removeKey(object, key) {
	if (!(key in object)) {
		return object;
	}
	
	var newObject = {};
	
	for (var k in object) {
		if (k !== key) {
			newObject[k] = object[k];
		}
	}
	
	return newObject;
}

$.mapObject = mapObject;

})($);
