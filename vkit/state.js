(function($){

var stateUpdates = [];
var currentUnmounts = null;

function noop(x){
	return x;
}

function map(query){
	return $(this).combine(query || noop);
}

function add(value){
	this.set(this.get() + value);
}

function toggle(){
	this.set(!this.get());
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

function css(key){
	var value = this.get();
	var onChange = this.onChange;
	return function(node){
		node.style[key] = value;
		onChange.subscribe(function(value){
			node.style[key] = value;
		});
	};
}

function effect(action){
	action(this.get());
	this.onChange.subscribe(action);
}

function getView(value, component, unmounts){
	var prevUnmounts = currentUnmounts;
	currentUnmounts = unmounts;
	try{
		return component(value);
	}finally{
		currentUnmounts = prevUnmounts;
	}
}

function is(component){
	var componentUnmounts = [];
	var value = this.get();
	var view = getView(value, component, componentUnmounts);
	var end = document.createTextNode("");
	
	this.onChange.subscribe(function(newValue){
		value = newValue;
		var el, parent, i, n;
		
		/* Call unmount functions */
		n = componentUnmounts.length;
		var unmounts = componentUnmounts.splice(0, n);
		for(i=0; i<n; ++i){
			unmounts[i]();
		}
		
		/* Remove old DOM nodes */
		for(i=view.length; i--;){
			el = view[i];
			parent = el.parentNode;
			parent.removeChild(el);
		}
		
		/* Insert new DOM nodes */
		view = getView(value, component, componentUnmounts);
		parent = end.parentNode;
		n = view.length;
		for(i=0; i<n; ++i){
			parent.insertBefore(view[i], end);
		}
	});
	
	return $.html(view, end);
}

$.state = function(value){
	var oldValue = value;
	var onChange = $.observable();
	
	function update(){
		if( value !== oldValue ){
			onChange(oldValue = value);
		}
	}
	
	update.queued = false;
	
	function get(){
		return value;
	}
	
	return {
		set: function(newValue){
			if( value !== newValue ){
				value = newValue;
				if(!update.queued){
					update.queued = true;
					stateUpdates.push(update);
				}
			}
		},
		add: add,
		toggle: toggle,
		get: get,
		map: map,
		onChange: onChange,
		text: text,
		prop: prop,
		css: css,
		effect: effect,
		is: is
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
	
	function unsubscribe(){
		for(var i=0; i<n; ++i){
			unsubscribes[i]();
		}
	}
	
	var states = this, n = states.length;
	var value = getValue();
	var onChange = $.observable();
	var unsubscribes = new Array(n);
	
	for(var i=0; i<n; ++i){
		unsubscribes[i] = states[i].onChange.subscribe(update);
	}
	
	return {
		get: getValue,
		map: map,
		onChange: onChange,
		text: text,
		prop: prop,
		css: css,
		effect: effect,
		is: is,
		unsubscribe: unsubscribe,
		until: function(func){
			func(unsubscribe);
			return this;
		}
	};
};

$.state.unmount = function(func){
	if( currentUnmounts ){
		currentUnmounts.push(func);
	}
};

$.state.render = function(){
	var n = stateUpdates.length;
	var updates = stateUpdates.splice(0, n);
	for(var i=0; i<n; ++i){
		var update = updates[i];
		update.queued = false;
		update();
	}
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
