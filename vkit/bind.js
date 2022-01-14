(function($){

var getCurrentComponent = $.component;

function bindStyle(prop, getter){
	return function(element){
		var style = element.style;
		var oldValue = style[prop] = getter(element);
		getCurrentComponent().subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = style[prop] = value;
			}
		});
	};
}

function bindProp(prop, getter){
	return function(element){
		var oldValue = element[prop] = getter(element);
		getCurrentComponent().subscribe(function(){
			var value = getter(element);
			if( oldValue!==value ){
				oldValue = element[prop] = value;
			}
		});
	};
}

function createText(getter){
	var oldValue = String(getter());
	var node = document.createTextNode(oldValue);
	getCurrentComponent().subscribe(function(){
		var value = String(getter());
		if( oldValue!==value ){
			oldValue = node.nodeValue = value;
		}
	});
	return node;
}

function createEffect(setter){
	setter();
	getCurrentComponent().subscribe(setter);
}

$.bind = {
	style: bindStyle,
	prop: bindProp
};
$.effect = createEffect;
$.text = createText;

})($);
