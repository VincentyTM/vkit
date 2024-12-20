(function($, document) {

function createStyleSheet() {
	var style = document.createElement("style");
	var textNode = null;
	
	try {
		textNode = document.createTextNode("");
		style.appendChild(textNode);
	} catch (ex) {
		textNode = null;
	}
	
	function setCSS(value) {
		if (textNode) {
			textNode.nodeValue = value;
		} else {
			style.innerText = value;
		}
	}
	
	return {
		element: style,
		setCSS: setCSS
	};
}

function createStyleController(name, updateStyle) {
	var refCount = 1;
	var value = "";
	
	function setValue(newValue) {
		if (value !== newValue) {
			value = newValue;
			updateStyle();
		}
	}
	
	function addRef() {
		++refCount;
	}
	
	function removeRef() {
		return --refCount === 0;
	}
	
	function toString() {
		return value;
	}
	
	return {
		addRef: addRef,
		removeRef: removeRef,
		setValue: setValue,
		name: name,
		toString: toString
	};
}

function createStyleContainer() {
	var style = createStyleSheet();
	var controllers = {};
	var controllersArray = [];
	
	function updateStyle() {
		style.setCSS(controllersArray.join("\n"));
	}
	
	function add(name) {
		var controller = controllers[name];
		
		if (controller) {
			controller.addRef();
			return controller;
		}
		
		var controller = controllers[name] = createStyleController(name, updateStyle);
		controllersArray.push(controller);
		return controller;
	}
	
	function remove(name) {
		var controller = controllers[name];
		
		if (controller && controller.removeRef()) {
			delete controllers[name];
			
			for (var i = controllersArray.length; i--;) {
				if (controllersArray[i].name === name) {
					controllersArray.splice(i, 1);
					updateStyle();
					break;
				}
			}
		}
		
		for (var k in controllers) {
			return false;
		}
		
		return true;
	}
	
	return {
		add: add,
		element: style.element,
		remove: remove
	};
}

$.createStyleContainer = createStyleContainer;

})($, document);
