(function($, document, navigator, global) {

var URL = global.URL || global.webkitURL || global.mozURL;

function save(blob, name) {
	if (navigator.msSaveOrOpenBlob) {
		navigator.msSaveOrOpenBlob(blob, name);
		return;
	}
	
	if (!URL) {
		throw new ReferenceError("URL is not supported");
	}
	
	var url = URL.createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url;
	a.download = name || blob.name || "file";
	a.click();
	URL.revokeObjectURL(url);
}

$.save = save;

})($, document, navigator, this);
