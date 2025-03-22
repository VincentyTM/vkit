(function($) {

var createEffect = $.createEffect;
var destroyEffect = $.destroyEffect;
var effect = $.effect;
var getEffect = $.getEffect;
var getInjector = $.getInjector;
var isSignal = $.isSignal;
var objectAssign = $.objectAssign;
var readOnly = $.readOnly;
var signal = $.signal;
var updateEffect = $.updateEffect;

function mapObject(objectSignal, mapKey, data) {
	var parent = getEffect();
	var injector = getInjector();
	var components = {};
	var values = signal({});
	
	function setObject(object) {
		for (var key in components) {
			if(!(key in object)) {
				destroyEffect(components[key]);
				values.update(removeKey, key);
			}
		}
		
		var next = {};
		
		for (var key in object) {
			if (key in components) {
				next[key] = components[key];
			} else {
				var mount = getMount(values, key, mapKey, objectSignal, data);
				var instanceEffect = createEffect(parent, injector, mount);
				next[key] = instanceEffect;
				updateEffect(instanceEffect);
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
