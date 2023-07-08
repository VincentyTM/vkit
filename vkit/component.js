(function($, document){

var insert = $.insert;
var remove = $.remove;
var createObservable = $.observable;

function createComponent(parent, stopUpdate){
	var children = [];
	
	var start = document.createTextNode("");
	var end = document.createTextNode("");
	
	var emitDestroy = createObservable();
	var emitUpdate = createObservable();
	
	return {
		index: 0,
		parent: parent,
		children: children,
		emitError: null,
		onDestroy: emitDestroy.subscribe,
		onUpdate: emitUpdate.subscribe,
		shouldUpdate: false,
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
		
		unmount: function(){
			for(var i=children.length; i--;){
				children[i].unmount();
			}
			
			emitDestroy();
			emitDestroy.clear();
		},
		
		update: function(){
			if(!this.shouldUpdate){
				return;
			}
			
			emitUpdate();
			
			if( stopUpdate ){
				return;
			}
			
			var n = children.length;
			
			for(var i=0; i<n; ++i){
				children[i].update();
			}
		},
		
		throwError: function(error){
			var component = this;
			
			while( component ){
				if( component.emitError ){
					try{
						component.emitError(error);
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
				removed.removeView();
				removed.unmount();
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
