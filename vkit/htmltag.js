(function($, undefined){

function setProps(el, props){
	for(var prop in props){
		var val = props[prop];
		if( prop.indexOf("on") === 0 ){
			$.state.on(prop.substring(2), val)(el);
		}else if( prop === "style" ){
			for(var cssProp in val){
				var cssVal = val[cssProp];
				if( typeof cssVal === "function" ){
					$.css(cssProp, cssVal)(el);
				}else if( cssVal && cssVal.css ){
					cssVal.css(cssProp)(el);
				}else{
					el.style[cssProp] = cssVal;
				}
			}
		}else{
			if( typeof val === "function" ){
				$.prop(prop, val)(el);
			}else if( val && val.prop ){
				val.prop(prop)(el);
			}else{
				el[prop] = val;
			}
		}
	}
}

$.htmlTag = function(tagName){
	return function(){
		var el = document.createElement(tagName);
		$.append(el, arguments, setProps);
		return el;
	};
};

if( typeof Proxy === "function" ){
	$.htmlTags = new Proxy({}, {
		get: function(target, prop, receiver){
			return $.htmlTag(prop.toLowerCase());
		}
	});
}

})($);
