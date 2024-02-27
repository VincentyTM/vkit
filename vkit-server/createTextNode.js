import escapeHTML from "./escapeHTML.js";

function tagReplacer(text) {
	return "<\\/" + text.substring(2);
}

export default function createTextNode(value) {
	value = String(value);
	
	function toHTML(res) {
		res.write(escapeHTML(value));
	}
	
	function toScriptContent(res) {
		res.write(value.replace(/<\/script\b/ig, tagReplacer));
	}
	
	function toStyleContent(res) {
		res.write(value.replace(/<\/style\b/ig, tagReplacer));
	}
	
	return {
		nodeType: 3,
		toHTML: toHTML,
		toScriptContent: toScriptContent,
		toStyleContent: toStyleContent
	};
}
