var createTextNode = require("./createTextNode.js");

function map(){
	var val = this.get();
	var n = arguments.length;
	for(var i=0; i<n; ++i){
		val = arguments[i](val);
	}
	return createState(val);
}

function prop(key){
	var value = this.get();
	return function(element){
		element[key] = value;
	};
}

function render(){
	return createTextNode(this.get());
}

function toString(){
	return "[object State(" + this.get() + ")]";
}

function view(getView){
	return getView(this.get());
}

function views(getView){
	var items = this.get();
	var n = items.length;
	var array = new Array(n);
	for(var i=0; i<n; ++i){
		array[i] = getView(items[i]);
	}
	return array;
}

function createState(value){
	return {
		get: function(){
			return value;
		},
		map: map,
		prop: prop,
		render: render,
		toString: toString,
		view: view
	};
}

module.exports = createState;
