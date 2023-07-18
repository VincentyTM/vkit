(function($, document){

var createObservable = $.observable;
var emitUnmount = $.emitUnmount;
var insert = $.insert;
var remove = $.remove;

function createComponent(parent){
	var children = [];
	
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	return {
		index: 0,
		parent: parent,
		children: children,
		emitError: null,
		unmount: null,
		start: start,
		end: end,
		
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
