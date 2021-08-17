(function($){

var updateStates = {}, maxId = 0;

function map(query){
	return $(this).combine(query);
}

function add(value){
	this.set(this.get() + value);
}

function text(){
	var node = document.createTextNode(this.get());
	this.onChange.subscribe(function(value){
		node.nodeValue = value;
	});
	return node;
}

function prop(key){
	var value = this.get();
	var onChange = this.onChange;
	return function(node){
		node[key] = value;
		onChange.subscribe(function(value){
			node[key] = value;
		});
	};
}

function effect(action){
	action(this.get());
	this.onChange.subscribe(action);
}

$.state = function(value){
	var oldValue = value;
	var onChange = $.observable();
	
	function update(){
		if( value !== oldValue ){
			onChange(oldValue = value);
		}
	}
	
	var id = ++maxId;
	update.id = id;
	
	function get(){
		return value;
	}
	
	return {
		set: function(newValue){
			if( value !== newValue ){
				value = newValue;
				updateStates[id] = update;
			}
		},
		add: add,
		get: get,
		map: map,
		onChange: onChange,
		text: text,
		prop: prop,
		effect: effect
	};
};

$.fn.combine = function(func){
	function getValue(){
		var values = new Array(n);
		for(var i=0; i<n; ++i){
			values[i] = states[i].get();
		}
		return func.apply(null, values);
	}
	
	function update(){
		var newValue = getValue();
		if( value !== newValue ){
			onChange(value = newValue);
		}
	}
	
	var states = this, n = states.length;
	var value = getValue();
	var onChange = $.observable();
	
	for(var i=0; i<n; ++i){
		states[i].onChange.subscribe(update);
	}
	
	return {
		get: getValue,
		map: map,
		onChange: onChange,
		text: text,
		prop: prop,
		effect: effect
	};
};

$.state.render = function(){
	for(var id in updateStates){
		updateStates[id]();
	}
	updateStates = {};
};

$.state.on = function(type, action){
	return function(element){
		element["on" + type] = function(){
			var ret = action.apply(this, arguments);
			$.state.render();
			return ret;
		};
	};
};

})($);