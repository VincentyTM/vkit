(function($){

function textSelection(element){
	var doc = element.ownerDocument;
	
	if( doc.selection ){
		var sel = doc.selection.createRange();
		var length = sel.text.length;
		var end = sel.text.length;
		
		sel.moveStart("character", -element.value.length);
		
		return {
			start: end - length,
			end: end
		};
	}else{
		return {
			start: element.selectionStart || 0,
			end: element.selectionEnd || 0
		};
	}
}

$.textSelection = textSelection;

})($);
