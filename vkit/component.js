(function($, document){

var createNodeRange = $.nodeRange;
var createObservable = $.observable;
var emitUnmount = $.emitUnmount;
var insert = $.insert;
var remove = $.remove;

function createComponent(parent){
	var children = [];
	var range = createNodeRange();
	
	return {
		index: 0,
		parent: parent,
		children: children,
		range: range,
		emitError: null,
		unmount: null,
		
		removeChild: function(index){
			var removed = children.splice(index, 1)[0];
			
			if( removed ){
				removed.removeView();
				emitUnmount(removed);
			}
		},
		
		removeView: function(){
			if( range.start.nextSibling ){
				range.remove();
			}
		},
		
		clearView: function(){
			if( range.start.nextSibling ){
				range.clear();
			}
		},
		
		insertView: function(view, anchor){
			insert([range.start, view, range.end], anchor, anchor.parentNode);
		},
		
		appendView: function(view){
			insert(view, range.end, range.end.parentNode);
		},
		
		replaceView: function(view){
			this.clearView();
			this.appendView(view);
		},
		
		getChildStart: function(index){
			var child = children[index];
			return child ? child.range.start : range.end;
		}
	};
}

$.component = createComponent;

})($, document);
