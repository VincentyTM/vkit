(function($) {

var isArray = $.isArray;

function queryParams(search) {
	var data = {};
	
	if (typeof search === "string") {
		if (search) {
			var array = search.split(/[&;]/);
			var n = array.length;
			
			for (var i = 0; i < n; ++i) {
				var item = array[i];
				var eqp = item.indexOf("=");
				
				if (eqp === -1) {
					add(decodeURIComponent(item), "");
				} else {
					add(decodeURIComponent(item.substring(0, eqp)), decodeURIComponent(item.substring(eqp + 1)));
				}
			}
		}
	} else if (search && search.isQueryParams === true) {
		return search.clone();
	}
	
	function getAsString(name) {
		var value = data[name];
		return isArray(value) ? value[0] : value || "";
	}
	
	function get(name) {
		return name in data ? data[name] : null;
	}
	
	function set(name, value) {
		if (typeof value === "string" || typeof value === "number") {
			data[name] = String(value);
		} else {
			delete data[name];
		}
		return this;
	}
	
	function has(name) {
		return name in data;
	}
	
	function del(name) {
		delete data[name];
		return this;
	}
	
	function add(name, value) {
		value = String(value);
		
		if (name in data) {
			if (typeof data[name] === "object") {
				data[name].push(value);
			} else {
				data[name] = [data[name], value];
			}
		} else {
			data[name] = value;
		}
		
		return this;
	}
	
	function each(func) {
		for (var name in data) {
			func(name, data[name]);
		}
		return this;
	}
	
	function clear() {
		for (var name in data) {
			delete data[name];
		}
		return this;
	}
	
	function clone() {
		var qp = queryParams();
		
		for (var name in data) {
			qp.set(name, data[name]);
		}
		
		return qp;
	}
	
	function toString() {
		var array = [];
		
		for (var name in data) {
			var value = data[name];
			var encodedName = encodeURIComponent(name);
			
			if (typeof value === "object") {
				var n = value.length;
				
				for (var i = 0; i < n; ++i) {
					array.push(encodedName + "=" + encodeURIComponent(value[i]));
				}
			} else {
				array.push(encodedName + "=" + encodeURIComponent(value));
			}
		}
		
		return array.join("&");
	}
	
	return {
		getAsString: getAsString,
		get: get,
		isQueryParams: true,
		set: set,
		has: has,
		del: del,
		add: add,
		each: each,
		clear: clear,
		clone: clone,
		toString: toString
	};
}

$.queryParams = queryParams;

})($);
