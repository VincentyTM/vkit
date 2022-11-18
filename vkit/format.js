(function($){

function splitText(text, pattern, transformIn, transformOut, nodes, offset){
	var match, last = 0;
	while( null !== (match = pattern.exec(text)) ){
		var a = pattern.lastIndex - match[0].length;
		var b = pattern.lastIndex;
		var matchedText = text.substring(a, b);
		nodes.push(
			transformOut(text.substring(last, a), offset + last),
			transformIn(matchedText, offset + a)
		);
		last = b;
	}
	if( last < text.length ){
		nodes.push(
			transformOut(text.substring(last), offset + last)
		);
	}
	return nodes;
}

function formatText(text, maps, index, offset){
	if(!index){
		index = 0;
	}
	if(!offset){
		offset = 0;
	}
	if( index >= maps.length ){
		return text;
	}
	var map = maps[index];
	return map.pattern ? splitText(
		text,
		map.pattern,
		map.component,
		function(subtext, innerOffset){
			return formatText(subtext, maps, index + 1, innerOffset);
		},
		[],
		offset
	) : map.component(text, offset);
}

$.format = formatText;

})($);
