(function($){
var onUnmount = $.onUnmount;

var createEffect = $.effect;
var count = 0;

function createStyleSelector(attr, attrValue){
	if(!attr){
		attr = "vkit-selector" + (++count);
	}
	var selector = "[" + attr + (attrValue ? "=" + attrValue : "") + "]";
	if(!attrValue){
		attrValue = "true";
	}
	function directive(cond){
		if( cond && typeof cond.setAttribute === "function" ){
			cond.setAttribute(attr, attrValue);
			onUnmount(function() {
				cond.removeAttribute(attr);
			});
			return;
		}
		return function(el){
			if( cond && typeof cond.effect === "function" ){
				cond.effect(function(value){
					value ? el.setAttribute(attr, attrValue) : el.removeAttribute(attr);
				});
			}else if( typeof cond === "function" ){
				createEffect(function(){
					cond() ? el.setAttribute(attr, attrValue) : el.removeAttribute(attr);
				});
			}else{
				cond ? el.setAttribute(attr, attrValue) : el.removeAttribute(attr);
			}
		};
	}
	directive.toString = function(){
		return selector;
	};
	return directive;
}

$.styleSelector = createStyleSelector;

})($);
