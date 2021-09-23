(function($){

function createComponent(parent, stopRender){
	var children = [];
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	return {
		index: 0,
		children: children,
		onRender: $.observable(),
		onDestroy: $.observable(),
		start: start,
		end: end,
		unmount: function(){
			for(var i=children.length; i--;){
				children[i].unmount();
			}
			this.onDestroy();
			this.onDestroy = $.observable();
		},
		render: function(){
			this.onRender();
			if( stopRender ){
				return;
			}
			var n = children.length;
			for(var i=0; i<n; ++i){
				children[i].render();
			}
		},
		removeChild: function(index){
			var removed = children.splice(index, 1)[0];
			if( removed ){
				removed.unmount();
				removed.removeView();
			}
		},
		removeView: function(){
			this.clearView();
			if( start.parentNode ) start.parentNode.removeChild(start);
			if( end.parentNode ) end.parentNode.removeChild(end);
		},
		clearView: function(){
			var parent = start.parentNode;
			if(!parent) return;
			for(var el=start.nextSibling; el && el !== end; el = start.nextSibling){
				parent.removeChild(el);
			}
		},
		insertView: function(view, anchor){
			var parent = anchor.parentNode;
			parent.insertBefore(start, anchor);
			var n = view.length;
			for(var i=0; i<n; ++i){
				parent.insertBefore(view[i], anchor);
			}
			parent.insertBefore(end, anchor);
		},
		replaceView: function(view){
			this.clearView();
			var parent = end.parentNode;
			var n = view.length;
			for(var i=0; i<n; ++i){
				parent.insertBefore(view[i], end);
			}
		},
		getChildStart: function(index){
			var child = children[index];
			return child ? child.start : end;
		}
	};
}

var onMount = $.observable();
var rootComponent = createComponent(null);
var currentComponent = rootComponent;

$.component = function(){
	var component = currentComponent;
	return {
		index: function(){
			return component.index;
		}
	};
};

$.render = function(){
	try{
		rootComponent.render();
		onMount();
	}finally{
		onMount = $.observable();
	}
};

$.mount = function(func){
	return onMount.subscribe(func);
};

$.unmount = function(func){
	return currentComponent.onDestroy.subscribe(func);
};

$.withComponent = function(func, doRender, component){
	var provider = $.getProvider();
	if(!component) component = currentComponent;
	return function(){
		var prevProvider = $.getProvider();
		var prevComponent = currentComponent;
		try{
			$.setProvider(provider);
			currentComponent = component;
			var ret = func.apply(this, arguments);
			if( doRender ){
				$.render();
			}
			return ret;
		}finally{
			$.setProvider(prevProvider);
			currentComponent = prevComponent;
		}
	};
};

$.is = function(getData, getView, immutable, onRender){
	var A = onRender ? getData : getData();
	var prev = currentComponent;
	var component = currentComponent = createComponent(prev, immutable);
	try{
		var view = getView(A);
		prev.children.push(component);
		(onRender || component.onRender).subscribe($.withComponent(function(newData){
			var B = onRender ? newData : getData();
			if( A === B ){
				return;
			}
			component.unmount();
			component.children.splice(0, component.children.length);
			component.replaceView($.group(getView(B)));
			A = B;
		}, false, component));
		return $.group(component.start, view, component.end);
	}finally{
		currentComponent = prev;
	}
};

$.map = function(array, getView, immutable, onRender){
	var oldArray = typeof array === "function" ? array() : array;
	var items = $.fn.toArray.call(oldArray);
	var prev = currentComponent;
	var container = createComponent(prev, immutable);
	prev.children.push(container);
	var n = items.length;
	var views = new Array(n);
	
	for(var i=0; i<n; ++i){
		try{
			var component = currentComponent = createComponent(container);
			component.index = i;
			views[i] = [component.start, getView(items[i]), component.end];
			container.children.push(component);
		}finally{
			currentComponent = prev;
		}
	}
	
	function insertItem(index, data){
		items.splice(index, 0, data);
		var prev = currentComponent;
		try{
			var component = currentComponent = createComponent(container);
			var view = $.group(getView(data));
			var anchor = container.getChildStart(index);
			component.insertView(view, anchor);
			container.children.splice(index, 0, component);
		}finally{
			currentComponent = prev;
		}
	}
	
	(onRender || container.onRender).subscribe($.withComponent(function(newArray){
		if(!newArray) newArray = typeof array === "function" ? array() : array;
		if( immutable && newArray === oldArray ){
			return;
		}
		var i, n=items.length, m=newArray.length;
		for(i=0; i<n; ++i){
			if( i<m ){
				var data = items[i];
				if( data === newArray[i] ){
					continue;
				}
				if( i+1<m ){
					if( data === newArray[i+1] ){
						insertItem(i, newArray[i]);
						++n; ++i;
						continue;
					}
					if( i+2<m ){
						if( data === newArray[i+2] ){
							insertItem(i, newArray[i+1]);
							insertItem(i, newArray[i]);
							n+=2; i+=2;
							continue;
						}
						if( i+3<m && data === newArray[i+3] ){
							insertItem(i, newArray[i+2]);
							insertItem(i, newArray[i+1]);
							insertItem(i, newArray[i]);
							n+=3; i+=3;
							continue;
						}
					}
				}
			}
			items.splice(i, 1);
			container.removeChild(i);
			--n; --i;
		}
		for(; i<m; ++i){
			insertItem(i, newArray[i]);
		}
		for(i=0; i<m; ++i){
			container.children[i].index = i;
		}
	}));
	
	return $.group(container.start, views, container.end);
};

$.on = function(type, action){
	return function(element){
		element["on" + type] = $.withComponent(action, true);
	};
};

$.effect = function(setter){
	setter();
	currentComponent.onRender.subscribe(setter);
};

$.css = function(prop, getter){
	return function(element){
		var style = element.style;
		var oldValue = style[prop] = getter(element);
		currentComponent.onRender.subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = style[prop] = value;
			}
		});
	};
};

$.prop = function(prop, getter){
	return function(element){
		var oldValue = element[prop] = getter(element);
		currentComponent.onRender.subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = element[prop] = value;
			}
		});
	};
};

$.text = function(getter){
	var oldValue;
	var node = document.createTextNode(oldValue = getter());
	currentComponent.onRender.subscribe(function(){
		var value = getter();
		if( oldValue!==value ){
			oldValue = node.nodeValue = value;
		}
	});
	return node;
};

})($);
