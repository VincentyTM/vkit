var append = require("./append.js");
var bind = require("./bind.js");
var createElement = require("./createElement.js");

function htmlTag(tagName){
	return function(){
		var el = createElement(tagName);
		append(el, arguments, el, bind);
		return el;
	};
}

module.exports = htmlTag;
