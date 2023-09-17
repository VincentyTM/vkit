export type StyleContainer = {
	add(name: string): StyleController;
	element: HTMLStyleElement;
	parent?: Node;
	remove(name: string): boolean;
};

export type StyleController = {
	addRef(): void;
	removeRef(): boolean;
	setValue(newValue: string): void;
	name: string;
	toString(): string;
};

type StyleSheetWrapper = {
	element: HTMLStyleElement,
	setCSS(value: string): void;
};

function createStyleSheet(): StyleSheetWrapper {
	var style = document.createElement("style");
	var textNode: Text | null = null;
	
	try {
		textNode = document.createTextNode("");
		style.appendChild(textNode);
	} catch (ex) {}
	
	function setCSS(value: string): void {
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

function createStyleController(name: string, updateStyle: () => void): StyleController {
	var refCount = 1;
	var value = "";
	
	function setValue(newValue: string): void {
		if (value !== newValue) {
			value = newValue;
			updateStyle();
		}
	}
	
	function addRef(): void {
		++refCount;
	}
	
	function removeRef(): boolean {
		return --refCount === 0;
	}
	
	function toString(): string {
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

export default function createStyleContainer(): StyleContainer {
	var style = createStyleSheet();
	var controllers: {[key: string]: StyleController} = {};
	var controllersArray: StyleController[] = [];
	
	function updateStyle(): void {
		style.setCSS(controllersArray.join("\n"));
	}
	
	function add(name: string): StyleController {
		var controller = controllers[name];
		
		if (controller) {
			controller.addRef();
			return controller;
		}
		
		var controller = controllers[name] = createStyleController(name, updateStyle);
		controllersArray.push(controller);
		return controller;
	}
	
	function remove(name: string): boolean {
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
		
		for (var _k in controllers) {
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
