(function($){

var noop = $.noop;
var onUnmount = $.onUnmount;

function intersectsWithBottom(a, b){
	var aRect = a.getBoundingClientRect();
	var bRect = b.getBoundingClientRect();
	
	return (
		aRect.top < bRect.bottom &&
		bRect.bottom < aRect.bottom &&
		aRect.left < bRect.right &&
		bRect.left < aRect.right
	);
}

function intersectsWithTop(a, b){
	var aRect = a.getBoundingClientRect();
	var bRect = b.getBoundingClientRect();
	
	return (
		aRect.top < bRect.top &&
		bRect.top < aRect.bottom &&
		aRect.left < bRect.right &&
		bRect.left < aRect.right
	);
}

function defaultEqual(a, b){
	return a === b;
}

function sortable(dragZone, items, options){
	var equal = options && options.equal || defaultEqual;
	var move = options && options.move || noop;
	var list = [];
	
	function bind(value){
		var lastValue = null;
		var lastDown = null;
		
		return [
			dragZone.draggable(function(el, x, y){
				el.style.left = x + "px";
				el.style.top = y + "px";
				
				for(var i=list.length; i--;){
					if( list[i].element !== el ){
						var item = list[i];
						
						if( intersectsWithTop(el, item.element) ){
							moveValueTo(value, lastValue = item.value, lastDown = false);
						}
						
						if( intersectsWithBottom(el, item.element) ){
							moveValueTo(value, lastValue = item.value, lastDown = true);
						}
					}
				}
			}, {
				start: function(el){
					el.style.position = "absolute";
				},
				end: function(el){
					el.style.position = "";
					el.style.left = "";
					el.style.top = "";
					move(value, lastValue, lastDown);
					lastValue = null;
					lastDown = null;
				}
			}),
			function(el){
				list.push({
					element: el,
					value: value
				});
				
				onUnmount(function(){
					for(var i=list.length; i--;){
						if( list[i].element === el ){
							list.splice(i, 1);
							break;
						}
					}
				});
			}
		];
	}
	
	function moveValueTo(a, b, down){
		if( a === b ){
			return;
		}
		
		var array = items.get();
		
		for(var i=array.length; i--;){
			if( array[i] === a ){
				if( down ){
					for(var j=array.length - 1; j > i; --j){
						if( equal(array[j], b, true) ){
							items.set(array.slice(0, i).concat(
								array.slice(i + 1, j),
								[b, a],
								array.slice(j + 1)
							));
							break;
						}
					}
				}else{
					for(var j=i - 1; j >= 0; --j){
						if( equal(array[j], b, false) ){
							items.set(array.slice(0, j).concat(
								array.slice(j + 1, i),
								[a, b],
								array.slice(i + 1)
							));
							break;
						}
					}
				}
				break;
			}
		}
	}
	
	return bind;
}

$.sortable = sortable;

})($);
