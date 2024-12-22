(function($) {

var effect = $.effect;
var getComponent = $.getComponent;
var getWindow = $.getWindow;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function renderFont() {
	return null;
}

function createFont(name, url, doc) {
	if (typeof name !== "string") {
		throw new TypeError("Font name must be a string");
	}
	
	if (!doc) {
		doc = getWindow().document;
	}
	
	var error = signal(null);
	var fontFaceState = signal(null);
	
	if (!(doc.fonts && typeof FontFace === "function")) {
		error.set(new Error("FontFace API is not supported"));
		return fontFaceState;
	}
	
	function setFont(url) {
		var fontFace = fontFaceState.get();
		
		if (fontFace) {
			doc.fonts["delete"](fontFace);
		}
		
		fontFaceState.set(null);
		
		if (url) {
			var fontFace = new FontFace(name, "url(" + url + ")");
			doc.fonts.add(fontFace);
			doc.fonts.load("1em " + name).then(function(array) {
				for (var i = array.length; i--;) {
					if (array[i] === fontFace) {
						fontFaceState.set(fontFace);
						break;
					}
				}
				
				update();
			}, function(ex) {
				error.set(ex);
				update();
			});
		}
	}
	
	if (typeof url === "function") {
		if (typeof url.effect === "function") {
			url.effect(setFont);
		} else {
			effect(function() {
				setFont(url());
			});
		}
	} else {
		setFont(url);
	}
	
	function remove() {
		setFont(null);
	}
	
	if (getComponent(true)) {
		onUnmount(remove);
	}
	
	var result = readOnly(fontFaceState);
	result.onError = error.subscribe;
	result.remove = remove;
	result.render = renderFont;
	
	return result;
}

$.font = createFont;

})($);
