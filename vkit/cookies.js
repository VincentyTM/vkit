(function($, undefined) {

var getWindow = $.getWindow;

var leadingAndTrailingWhitespaces = /(^\s+)|(\s+$)/g;

function cookies(doc) {
	if (!doc) {
		doc = getWindow().document;
	}
	
	function deleteCookie(name, options) {
		setCookie(name, "", 0, options);
	}
	
	function forEach(callback) {
		var rc = doc.cookie;
		
		if (rc) {
			var cookies = rc.split(";");
			var n = cookies.length;
			
			for (var i = 0; i < n; ++i) {
				var cookie = cookies[i].replace(leadingAndTrailingWhitespaces, "").split("=");
				callback(decodeURIComponent(cookie[0]), decodeURIComponent(cookie[1]));
			}
		}
	}
	
	function getCookie(name) {
		var cookies = ";" + doc.cookie.replace(/\s/g, "");
		var search = ";" + encodeURIComponent(name) + "=";
		var offset = cookies.indexOf(search);
		
		if (offset === -1) {
			return null;
		}
		
		offset += search.length;
		var end = cookies.indexOf(";", offset);
		
		if (end === -1) {
			end = cookies.length;
		}
		
		return decodeURIComponent(cookies.substring(offset, end));
	}
	
	function setCookie(name, value, expiry, options) {
		var cookie = [
			encodeURIComponent(name),
			"=",
			encodeURIComponent(value)
		];
		
		if (expiry !== undefined && expiry !== null) {
			cookie.push("; Expires=", new Date(expiry).toUTCString());
		}
		
		if (options && options.secure) {
			cookie.push("; Secure");
		}
		
		if (options && options.httpOnly) {
			cookie.push("; HttpOnly");
		}
		
		cookie.push(
			"; SameSite=", options && options.sameSite || "Strict",
			"; Path=", options && options.path || "/"
		);
		
		doc.cookie = cookie.join("");
	}
	
	return {
		deleteCookie: deleteCookie,
		forEach: forEach,
		getCookie: getCookie,
		setCookie: setCookie
	};
}

$.cookies = cookies;

})($);
