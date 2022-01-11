(function($){

function queryParams(search){
	var data = {};
	if( typeof search === "string" ){
		if( search ){
			var array = search.split(/[&;]/);
			var n = array.length;
			for(var i=0; i<n; ++i){
				var item = array[i];
				var eqp = item.indexOf("=");
				if( eqp === -1 ){
					add(decodeURIComponent(item), "");
				}else{
					add(decodeURIComponent(item.substring(0, eqp)), decodeURIComponent(item.substring(eqp + 1)));
				}
			}
		}
	}else if( search && typeof search.clone === "function" ){
		return search.clone();
	}
	function get(name){
		return data[name] || "";
	}
	function set(name, value){
		data[name] = value;
		return this;
	}
	function has(name){
		return name in data;
	}
	function del(name){
		delete data[name];
		return this;
	}
	function add(name, value){
		if( name in data ){
			if( typeof data[name] === "object" ){
				data[name].push(value);
			}else{
				data[name] = [data[name], value];
			}
		}else{
			data[name] = value;
		}
		return this;
	}
	function clone(){
		var qp = queryParams();
		for(var name in data){
			qp.set(name, data[name]);
		}
		return qp;
	}
	function toString(){
		var array = [];
		for(var name in data){
			var value = data[name];
			var encodedName = encodeURIComponent(name);
			if( typeof value === "object" ){
				var n = value.length;
				for(var i=0; i<n; ++i){
					array.push(encodedName + "=" + encodeURIComponent(value[i]));
				}
			}else{
				array.push(encodedName + "=" + encodeURIComponent(value));
			}
		}
		return array.join("&");
	}
	return {
		get: get,
		set: set,
		has: has,
		del: del,
		clone: clone,
		text: toString,
		toString: toString
	};
}

$.queryParams = queryParams;

})($);
