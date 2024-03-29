(function($) {

var windowData = $.windowData;

function getMetaElement(head, name, document) {
	var metas = head.getElementsByTagName("meta");
	
	for (var i = metas.length; i--;) {
		var meta = metas[i];
		
		if (meta.name === name) {
			return meta;
		}
	}
	
	var meta = document.createElement("meta");
	meta.name = name;
	head.appendChild(meta);
	return meta;
}

function setMeta(name, content) {
	function init(win, callback) {
		var document = win.document;
		var head = document.head || document.getElementsByTagName("head")[0];
		var meta = getMetaElement(head, name, document);
		
		callback(meta.content, function(content) {
			meta.content = content;
		});
	}
	
	windowData("meta:" + name, init)(content);
}

$.meta = setMeta;

})($);
