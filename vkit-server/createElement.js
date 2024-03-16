import createTextNode from "./createTextNode.js";
import escapeHTML from "./escapeHTML.js";

var selfClosingTags = {
	area: 1,
	base: 1,
	br: 1,
	col: 1,
	embed: 1,
	hr: 1,
	img: 1,
	input: 1,
	link: 1,
	meta: 1,
	param: 1,
	source: 1,
	track: 1,
	wbr: 1
};

function propToAttr(name) {
	if (name === "className") return "class";
	if (name === "htmlFor") return "for";
	if (name.indexOf("aria") === 0) {
		return name.replace(/[A-Z]/g, replaceUpperCase);
	}
	return name.toLowerCase();
}

function replaceUpperCase(letter) {
	return "-" + letter.toLowerCase();
}

export default function createElement(tagName) {
	var attributes = {};
	var styleProps = {};
	var tagNameLower = tagName.toLowerCase();
	var children = selfClosingTags[tagNameLower] ? null : [];
	
	function appendChild(child) {
		children.push(child);
	}
	
	function getAttribute(name) {
		return name in attributes ? attributes[name] : null;
	}
	
	function getProperty(name) {
		return getAttribute(propToAttr(name));
	}
	
	function hasAttribute(name) {
		return name in attributes;
	}
	
	function removeAttribute(name) {
		delete attributes[name];
	}
	
	function setAttribute(name, value) {
		attributes[name] = value;
	}
	
	function setProperty(name, value) {
		if (typeof value === "boolean") {
			if (value) {
				setAttribute(propToAttr(name), "");
			} else {
				removeAttribute(propToAttr(name));
			}
		} else if (name === "value" && tagNameLower === "textarea") {
			appendChild(createTextNode(value));
		} else {
			setAttribute(propToAttr(name), value);
		}
	}
	
	function setStyleProperty(name, value) {
		name = name.replace(/[A-Z]/g, replaceUpperCase);
		styleProps[name] = typeof value === "function" ? value() : value;
	}
	
	function toHTML(res) {
		var styleArray = [];
		
		for (var name in styleProps) {
			styleArray.push(name, ':', styleProps[name], ';');
		}
		
		res.write('<');
		res.write(tagName);
		
		for (var name in attributes) {
			res.write(' ');
			res.write(escapeHTML(name));
			
			if (attributes[name]) {
				res.write('="');
				res.write(escapeHTML(attributes[name]));
				res.write('"');
			}
		}
		
		if (styleArray.length > 0) {
			res.write(' style="');
			res.write(escapeHTML(styleArray.join('')));
			res.write('"');
		}
		
		res.write('>');
		
		if (children) {
			var n = children.length;
			
			switch (tagNameLower) {
				case "script":
					for (var i = 0; i < n; ++i) {
						if (!children[i].toScriptContent) {
							throw new Error("Only text nodes are allowed in script elements");
						}
						children[i].toScriptContent(res);
					}
					break;
				case "style":
					for (var i = 0; i < n; ++i) {
						if (!children[i].toStyleContent) {
							throw new Error("Only text nodes are allowed in style elements");
						}
						children[i].toStyleContent(res);
					}
					break;
				case "textarea":
					for (var i = 0; i < n; ++i) {
						if (children[i].nodeType !== 3) {
							throw new Error("Only text nodes are allowed in textarea elements");
						}
						children[i].toHTML(res);
					}
					break;
				default:
					for (var i = 0; i < n; ++i) {
						children[i].toHTML(res);
					}
			}
			res.write('</');
			res.write(tagName);
			res.write('>');
		}
	}
	
	return {
		appendChild: appendChild,
		getAttribute: getAttribute,
		getProperty: getProperty,
		hasAttribute: hasAttribute,
		nodeType: 1,
		removeAttribute: removeAttribute,
		setAttribute: setAttribute,
		setProperty: setProperty,
		setStyleProperty: setStyleProperty,
		toHTML: toHTML
	};
}
