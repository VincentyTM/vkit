(function($){

var bindAttributes = $.attributes;
var escapeHTML = $.escapeHTML;

function attributesOf(element){
	var attrs = element.attributes;
	var map = {};
	var n = attrs.length;
	var parts = new Array(n);
	for(var i=0; i<n; ++i){
		var attr = attrs[i];
		var name = attr.name;
		var value = attr.value;
		map[name] = value;
		parts[i] = ' ' + name + '="' + escapeHTML(value) + '"';
	}
	var string = parts.join('');
	
	function toString(){
		return string;
	}
	
	var binding = bindAttributes(map);
	binding.toString = toString;
	return binding;
}

$.attributesOf = attributesOf;

})($);
