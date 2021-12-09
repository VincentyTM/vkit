(function($){

var on = $.on;
var setStyle = $.style;
var setProp = $.prop;

function setProps(el, props){
	for(var prop in props){
		var val = props[prop];
		if( prop.indexOf("on") === 0 ){
			on(prop.substring(2), val)(el);
		}else if( prop === "style" ){
			for(var cssProp in val){
				var cssVal = val[cssProp];
				if( typeof cssVal === "function" ){
					setStyle(cssProp, cssVal)(el);
				}else if( cssVal && cssVal.style ){
					cssVal.style(cssProp)(el);
				}else{
					el.style[cssProp] = cssVal;
				}
			}
		}else{
			if( typeof val === "function" ){
				setProp(prop, val)(el);
			}else if( val && val.prop ){
				val.prop(prop)(el);
			}else{
				el[prop] = val;
			}
		}
	}
}

$.setProps = setProps;

})($);
