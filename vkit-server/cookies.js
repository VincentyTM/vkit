import {getScope} from "./scope.js";

var leadingAndTrailingWhitespaces = /(^\s+)|(\s+$)/g;

export default function cookies() {
	var currentScope = getScope();
	var req = currentScope.req;
	var res = currentScope.res;
	var resCookies = currentScope.cookies;
	
	function deleteCookie(name, options) {
		setCookie(name, "", 0, options);
	}
	
	function forEach(callback) {
		var rc = req.headers.cookie;
		
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
		var rc = req.headers.cookie;
		
		if (!rc) {
			return null;
		}
		
		rc = rc.split(";");
		
		var n = rc.length;
		
		for (var i = 0; i < n; ++i) {
			var token = rc[i];
			var cookie = token.replace(leadingAndTrailingWhitespaces, "").split("=");
			
			if (cookie[0] === name) {
				return decodeURIComponent(cookie[1]);
			}
		}
		
		return null;
	}
	
	function setCookie(name, value, expiry, options) {
		var suffix = [];
		
		if (expiry !== undefined && expiry !== null) {
			suffix.push("; Expires=", new Date(expiry).toUTCString());
		}
		
		if (options && options.secure) {
			suffix.push("; Secure");
		}
		
		if (options && options.httpOnly) {
			suffix.push("; HttpOnly");
		}
		
		suffix.push(
			"; SameSite=", options && options.sameSite || "Strict",
			"; Path=", options && options.path || "/"
		);
		
		resCookies[name] = {
			value: value,
			suffix: suffix.join("")
		};
		
		setResponseHeader();
	}
	
	function setResponseHeader() {
		var cookies = [];
		
		for (var name in resCookies) {
			var cookie = resCookies[name];
			var cookieString = [
				encodeURIComponent(name),
				"=",
				encodeURIComponent(cookie.value),
				cookie.suffix
			].join("");
			cookies.push(cookieString);
		}
		
		res.setHeader("set-cookie", cookies);
	}
	
	return {
		deleteCookie: deleteCookie,
		forEach: forEach,
		getCookie: getCookie,
		setCookie: setCookie
	};
}
