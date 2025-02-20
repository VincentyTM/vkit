export interface StyleContainer {
	readonly element: HTMLStyleElement;
	parent?: Node;
	add(name: string): StyleController;
	remove(name: string): boolean;
}

export interface StyleController {
	readonly name: string;
	addRef(): void;
	removeRef(): boolean;
	setValue(newValue: string): void;
	toString(): string;
}

interface StyleSheetWrapper {
	readonly element: HTMLStyleElement;
	setCSS(value: string): void;
}

function createStyleSheet(): StyleSheetWrapper {
	var style = document.createElement("style");
	var textNode: Text | null = null;
	
	try {
		textNode = document.createTextNode("");
		style.appendChild(textNode);
	} catch (ex) {
		textNode = null;
	}
	
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
		name: name,
		addRef: addRef,
		removeRef: removeRef,
		setValue: setValue,
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
		element: style.element,
		add: add,
		remove: remove
	};
}
