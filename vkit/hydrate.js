(function($, document) {

var bind = $.bind;
var deepPush = $.deepPush;
var isArray = $.isArray;

function append(parent, children) {
	var pushedNodes = [];
	deepPush(pushedNodes, children, parent, bind);
	return pushedNodes;
}

function createNode(child) {
	if (typeof child === "string") {
		return document.createTextNode(child);
	}
	
	if (!child.isVirtual) {
		return child;
	}
	
	var element = document.createElement(child.nodeName);
	var children = append(element, child.arguments);
	hydrateElement(element, children);
	return element;
}

function getNodeName(child) {
	return typeof child === "string" ? "#text" : child.nodeName;
}

function getText(child) {
	return child && typeof child.nodeValue === "string" ? child.nodeValue : typeof child === "string" ? child : "";
}

function isText(child) {
	return typeof child === "string" || (child && child.nodeValue === 3);
}

function hydrate(parent, child, state) {
	if (!state) {
		state = {
			index: 0,
			lastText: null
		};
	}
	
	if (isArray(child)) {
		var n = child.length;
		
		for (var i = 0; i < n; ++i) {
			hydrate(parent, child[i], state);
		}
		
		return;
	}
	
	if (child && typeof child.render === "function") {
		hydrate(parent, child.render(), state);
		return;
	}
	
	if (state.lastText) {
		if (isText(child)) {
			state.lastText.parentNode.insertBefore(
				createNode(child),
				state.lastText.nextSibling
			);
			return;
		}
		
		state.lastText = null;
	}
	
	var existingChild = parent.childNodes[state.index];
	
	if (!existingChild) {
		parent.appendChild(createNode(child));
		++state.index;
		return;
	}
	
	if (existingChild.nodeName !== getNodeName(child)) {
		parent.replaceChild(createNode(child), existingChild);
		++state.index;
		return;
	}
	
	if (existingChild.nodeType === 3) {
		existingChild.nodeValue = getText(child);
		state.lastText = existingChild;
		++state.index;
		return;
	}
	
	if (child.isVirtual) {
		var children = append(existingChild, child.arguments);
		hydrateElement(existingChild, children);
		++state.index;
		return;
	}
	
	parent.replaceChild(child, existingChild);
	++state.index;
}

function hydrateElement(parent, children) {
	var state = {
		index: 0,
		lastText: null
	};
	
	hydrate(parent, children, state);
	
	var index = state.index;
	var childNodes = parent.childNodes;
	var child;
	
	while (child = childNodes[index]) {
		parent.removeChild(child);
	}
}

$.hydrate = hydrateElement;

})($, document);
