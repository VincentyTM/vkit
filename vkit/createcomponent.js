(function($){

var insert = $.insert;
var remove = $.remove;
var createObservable = $.observable;

function createComponent(parent, stopRender){
	var children = [];
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	return {
		index: 0,
		parent: parent,
		children: children,
		onRender: createObservable(),
		onDestroy: createObservable(),
		onError: null,
		shouldRender: false,
		start: start,
		end: end,
		subscribe: function(update){
			var curr = this;
			while( curr && !curr.shouldRender ){
				curr.shouldRender = true;
				curr = curr.parent;
			}
			return this.onRender.subscribe(update);
		},
		unmount: function(){
			for(var i=children.length; i--;){
				children[i].unmount();
			}
			this.onDestroy();
			this.onDestroy.clear();
		},
		render: function(){
			if(!this.shouldRender){
				return;
			}
			this.onRender();
			if( stopRender ){
				return;
			}
			var n = children.length;
			for(var i=0; i<n; ++i){
				children[i].render();
			}
		},
		throwError: function(error){
			var component = this;
			while( component ){
				if( component.onError ){
					try{
						component.onError(error);
						return;
					}catch(ex){
						error = ex;
					}
				}
				component = component.parent;
			}
			throw error;
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
			remove(start);
			remove(end);
		},
		clearView: function(){
			var parent = start.parentNode;
			if(!parent) return;
			for(var el=end.previousSibling; el && el !== start; el = end.previousSibling){
				parent.removeChild(el);
			}
		},
		insertView: function(view, anchor){
			insert([start, view, end], anchor, anchor.parentNode);
		},
		replaceView: function(view){
			this.clearView();
			insert(view, end, end.parentNode);
		},
		getChildStart: function(index){
			var child = children[index];
			return child ? child.start : end;
		}
	};
}

$.component = createComponent;

})($);
