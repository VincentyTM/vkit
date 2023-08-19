(function($){

function selectText(element, start, end){
	if( element.setSelectionRange ){
		element.focus();
		element.setSelectionRange(start, end);
	}else if( element.createTextRange ){
		var range = element.createTextRange();
		range.collapse(true);
		range.moveEnd("character", start);
		range.moveStart("character", end);
		range.select();
	}else{
		element.focus();
		element.selectionStart = start;
		element.selectionEnd = end;
	}
}

$.selectText = selectText;

})($);
