(function($, document){

var createObservable = $.observable;
var emitUnmount = $.emitUnmount;
var emitUpdate = $.emitUpdate;
var insert = $.insert;
var remove = $.remove;

function createComponent(parent, stopUpdate){
	var children = [];
	
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	var emitUpdate = createObservable();
	
	return {
		index: 0,
		parent: parent,
		children: children,
		emitError: null,
		emitUpdate: emitUpdate,
		shouldUpdate: false,
		stopUpdate: stopUpdate,
		unmount: null,
		start: start,
		end: end,
		
		subscribe: function(update){
			var curr = this;
			
			while( curr && !curr.shouldUpdate ){
				curr.shouldUpdate = true;
				curr = curr.parent;
			}
			
			return emitUpdate.subscribe(update);
		},
		
		removeChild: function(index){
			var removed = children.splice(index, 1)[0];
			
			if( removed ){
				removed.removeView();
				emitUnmount(removed);
			}
		},
		
		removeView: function(){
			this.clearView();
			remove(start);
			remove(end);
		},
		
		clearView: function(){
			var parent = start.parentNode;
			
			if(!parent){
				return;
			}
			
			for(var el=end.previousSibling; el && el !== start; el = end.previousSibling){
				parent.removeChild(el);
			}
		},
		
		insertView: function(view, anchor){
			insert([start, view, end], anchor, anchor.parentNode);
		},
		
		appendView: function(view){
			insert(view, end, end.parentNode);
		},
		
		replaceView: function(view){
			this.clearView();
			this.appendView(view);
		},
		
		getChildStart: function(index){
			var child = children[index];
			return child ? child.start : end;
		}
	};
}

$.component = createComponent;

})($, document);
