(function($, document, global){

var URL = global.URL || global.webkitURL;

function save(blob, name){
	if(!URL){
		throw new ReferenceError("URL is not supported");
	}
	var url = URL.createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url;
	a.download = name;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

$.save = save;

})($, document, this);
