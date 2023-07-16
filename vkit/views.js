(function($){

var createComponent = $.component;
var getComponent = $.getComponent;
var onUpdate = $.onUpdate;
var setComponent = $.setComponent;
var withContext = $.withContext;
var toArray = $.toArray;

function createViews(array, getView, immutable, update){
	var prev = getComponent();
	var oldArray = typeof array === "function" ? array() : array;
	var items = toArray(oldArray);
	var container = createComponent(prev, immutable);
	prev.children.push(container);
	var n = items.length;
	var views = new Array(n);
	
	for(var i=0; i<n; ++i){
		try{
			var component = createComponent(container);
			setComponent(component);
			component.index = i;
			views[i] = [component.start, getView(items[i]), component.end];
			container.children.push(component);
		}finally{
			setComponent(prev);
		}
	}
	
	function insertItem(index, value){
		items.splice(index, 0, value);
		
		var prev = getComponent();
		
		try{
			var component = createComponent(container);
			setComponent(component);
			
			var view = getView(value);
			var anchor = container.getChildStart(index);
			
			component.insertView(view, anchor);
			container.children.splice(index, 0, component);
		}finally{
			setComponent(prev);
		}
	}
	
	var updateViews = withContext(function(newArray){
		if(!newArray){
			newArray = typeof array === "function" ? array() : array;
		}
		
		if( immutable && newArray === oldArray ){
			return;
		}
		
		var i, n=items.length, m=newArray.length;
		
		for(i=0; i<n; ++i){
			if( i < m ){
				var value = items[i];
				
				if( value === newArray[i] ){
					continue;
				}
				
				if( i + 1 < m ){
					if( value === newArray[i + 1] ){
						insertItem(i, newArray[i]);
						++n; ++i;
						continue;
					}
					
					if( i + 2 < m ){
						if( value === newArray[i + 2] ){
							insertItem(i, newArray[i + 1]);
							insertItem(i, newArray[i]);
							n += 2;
							i += 2;
							continue;
						}
						
						if( i + 3 < m && value === newArray[i + 3] ){
							insertItem(i, newArray[i + 2]);
							insertItem(i, newArray[i + 1]);
							insertItem(i, newArray[i]);
							n += 3;
							i += 3;
							continue;
						}
					}
				}
			}
			
			items.splice(i, 1);
			container.removeChild(i);
			--n;
			--i;
		}
		
		for(; i<m; ++i){
			insertItem(i, newArray[i]);
		}
		
		for(i=0; i<m; ++i){
			container.children[i].index = i;
		}
	});
	
	if( update ){
		update.subscribe(updateViews);
	}else{
		onUpdate(updateViews, container);
	}
	
	return [container.start, views, container.end];
}

$.views = createViews;

})($);
