(function($, document){

function createCookieHandle(name, doc){
	if(!doc) doc = document;
	var value = "";
	var expiry = null;
	
	function expires(newExpiry){
		if( newExpiry === null ){
			expiry = null;
		}else{
			expiry = new Date();
			expiry.setTime(newExpiry);
		}
		return this;
	}
	
	function get(){
		var cookies = ";" + doc.cookie.replace(/\s/g, "");
		var search = ";" + encodeURIComponent(name) + "=";
		var offset = cookies.indexOf(search);
		if(~offset){
			offset += search.length;
			var end = cookies.indexOf(";", offset);
			if( end === -1 ){
				end = cookies.length;
			}
			return (
				value = decodeURIComponent(cookies.substring(offset, end))
			);
		}
		return "";
	}
	
	function remove(){
		expires(0);
		set("");
		return this;
	}
	
	function set(newValue){
		value = newValue;
		doc.cookie = (
			encodeURIComponent(name) + "=" +
			encodeURIComponent(value) + "; " + 
			(expiry === null ? "" : "expires=" + expiry.toUTCString() + "; ") +
			"path=/"
		);
		return this;
	}
	
	return {
		expires: expires,
		get: get,
		remove: remove,
		set: set,
		toString: get
	};
}

function forEachCookie(callback, doc){
	if(!doc) doc = document;
	var ca = doc.cookie.replace(/\s/g, "").split(";");
	var n = ca.length;
	for(var i=0; i<n; ++i){
		var c = ca[i];
		var e = c.indexOf("=");
		var cookie = createCookieHandle(decodeURIComponent(c.substring(0, e)));
		cookie.value = decodeURIComponent(c.substring(e + 1));
		callback(cookie);
	}
}

$.cookie = createCookieHandle;
$.cookie.each = forEachCookie;

})($, document);
