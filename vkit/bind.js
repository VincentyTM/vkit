(function($){

var getCurrentComponent = $.currentComponent;
var on = $.on;

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

function bind(el, props){
	for(var prop in props){
		var val = props[prop];
		if( prop.indexOf("on") === 0 ){
			on(prop.substring(2), val)(el);
		}else if( prop === "style" ){
			for(var cssProp in val){
				var cssVal = val[cssProp];
				if( typeof cssVal === "function" ){
					bindStyle(cssProp, cssVal)(el);
				}else if( cssVal && cssVal.style ){
					cssVal.style(cssProp)(el);
				}else{
					el.style[cssProp] = cssVal;
				}
			}
		}else{
			if( typeof val === "function" ){
				bindProp(prop, val)(el);
			}else if( val && val.prop ){
				val.prop(prop)(el);
			}else{
				el[prop] = val;
			}
		}
	}
}

function bindAll(props){
	var n = this.length;
	for(var i=0; i<n; ++i){
		bind(this[i], props);
	}
	return this;
}

$.text = createText;
$.effect = createEffect;
$.bind = bind;
$.bindProp = bindProp;
$.bindStyle = bindStyle;
$.fn.bind = bindAll;

})($);
