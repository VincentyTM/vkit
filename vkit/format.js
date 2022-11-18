(function($){

function splitText(text, pattern, transformIn, transformOut, nodes){
	var match, last = 0;
	while( null !== (match = pattern.exec(text)) ){
		var a = pattern.lastIndex - match[0].length;
		var b = pattern.lastIndex;
		var matchedText = text.substring(a, b);
		nodes.push(
			transformOut(text.substring(last, a)),
			transformIn(matchedText)
		);
		last = b;
	}
	if( last < text.length ){
		nodes.push(
			transformOut(text.substring(last))
		);
	}
	return nodes;
}

function formatText(text, maps, index){
	if(!index){
		index = 0;
	}
	if( index >= maps.length ){
		return text;
	}
	var map = maps[index];
	return map.pattern ? splitText(
		text,
		map.pattern,
		map.component,
		function(subtext){
			return formatText(subtext, maps, index + 1);
		},
		[]
	) : map.component(text);
}

$.format = formatText;

})($);
