(function($){

function insertText(element, value){
	var doc = element.ownerDocument;
	
	if( doc.selection ){
		element.focus();
		
		var sel = doc.selection.createRange();
		sel.text = typeof value === "function" ? value(sel.text) : value;
		sel.moveStart("character", -element.value.length);
		
		var pos = sel.text.length;
		var range = element.createTextRange();
		range.collapse(true);
		range.moveEnd("character", pos);
		range.moveStart("character", pos);
		range.select();
	}else if( "selectionStart" in element ){
		var s = element.selectionStart;
		var e = element.selectionEnd;
		
		if( typeof value === "function" ){
			value = value(element.value.substring(s, e));
		}
		
		if(!doc.execCommand || !doc.execCommand("insertText", false, value)){
			element.value = element.value.substring(0, s) + value + element.value.substring(e);
		}
		
		var c = s + value.length;
		
		element.focus();
		element.setSelectionRange(c, c);
	}
}

$.insertText = insertText;

})($);
