var createTextNode = require("./createTextNode.js");
var escapeHTML = require("./escapeHTML.js");

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

function propToAttr(name){
	if( name === "className" ) return "class";
	if( name === "htmlFor" ) return "for";
	return name.toLowerCase();
}

function createElement(tagName){
	var attributes = {};
	var children = selfClosingTags[tagName] ? null : [];
	
	function appendChild(child){
		children.push(child);
	}
	
	function getAttribute(name){
		return name in attributes ? attributes[name] : null;
	}
	
	function getProperty(name){
		return getAttribute(propToAttr(name));
	}
	
	function hasAttribute(name){
		return name in attributes;
	}
	
	function removeAttribute(name){
		delete attributes[name];
	}
	
	function setAttribute(name, value){
		attributes[name] = value;
	}
	
	function setProperty(name, value){
		if( typeof value === "boolean" ){
			if( value ){
				setAttribute(name, "");
			}else{
				removeAttribute(name);
			}
		}else if( name === "value" && tagName === "textarea" ){
			appendChild(createTextNode(value));
		}else{
			setAttribute(propToAttr(name), value);
		}
	}
	
	function toHTML(res){
		res.write('<');
		res.write(tagName);
		for(var name in attributes){
			res.write(' ');
			res.write(escapeHTML(name));
			if( attributes[name] ){
				res.write('="');
				res.write(escapeHTML(attributes[name]));
				res.write('"');
			}
		}
		res.write('>');
		if( children ){
			var n = children.length;
			switch(tagName){
				case "script":
					for(var i=0; i<n; ++i){
						if(!children[i].toScriptContent){
							throw new Error("Only text nodes are allowed in script elements");
						}
						children[i].toScriptContent(res);
					}
					break;
				case "style":
					for(var i=0; i<n; ++i){
						if(!children[i].toStyleContent){
							throw new Error("Only text nodes are allowed in style elements");
						}
						children[i].toStyleContent(res);
					}
					break;
				case "textarea":
					for(var i=0; i<n; ++i){
						if( children[i].nodeType !== 3 ){
							throw new Error("Only text nodes are allowed in textarea elements");
						}
						children[i].toHTML(res);
					}
					break;
				default:
					for(var i=0; i<n; ++i){
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
		toHTML: toHTML
	};
}

module.exports = createElement;
