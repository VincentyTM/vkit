(function($){

$.fn.selection=function(){
	var ctrl=this[0];
	if( document.selection ){
		var sel=document.selection.createRange();
		var length=sel.text.length;
		sel.moveStart("character", -ctrl.value.length);
		var end=sel.text.length;
		return {
			"start": end - length,
			"end": end
		};
	}else{
		return {
			"start": ctrl.selectionStart || 0,
			"end": ctrl.selectionEnd || 0
		};
	}
};

$.fn.select=function(start, end){
	var ctrl=this[0];
	if( ctrl.setSelectionRange ){
		ctrl.focus();
		ctrl.setSelectionRange(start, end);
	}else if( ctrl.createTextRange ){
		var range=ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd("character", start);
		range.moveStart("character", end);
		range.select();
	}else{
		ctrl.focus();
		ctrl.selectionStart=start;
		ctrl.selectionEnd=end;
	}
};

$.fn.insertText=function(value){
	var ctrl=this[0];
	if( document.selection ){
		ctrl.focus();
		var sel=document.selection.createRange();
		sel.text=typeof value=="function" ? value(sel.text) : value;
		sel.moveStart("character", -ctrl.value.length);
		var pos=sel.text.length;
		var range=ctrl.createTextRange();
		range.collapse(true);
		range.moveEnd("character", pos);
		range.moveStart("character", pos);
		range.select();
	}else if( "selectionStart" in ctrl ){
		var s=ctrl.selectionStart;
		var e=ctrl.selectionEnd;
		if( typeof value=="function" ){
			value=value(ctrl.value.substring(s, e));
		}
		if(!document.execCommand || !document.execCommand("insertText", false, value)){
			ctrl.value=ctrl.value.substring(0, s) + value + ctrl.value.substring(e);
		}
		var c=s+value.length;
		ctrl.focus();
		ctrl.setSelectionRange(c, c);
	}
};

})($);
