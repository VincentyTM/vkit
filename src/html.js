(function($, undefined){

function findNodes(result, container, type){
	if( container.nodeType===type )
		result.push(container);

	var children = container.childNodes;
	if(!children)
		return;
	
	for(var i=0, l=children.length; i<l; ++i)
		findNodes(result, children[i], type);
}

function deepInsert(object, parent, nextSibling){
	if(!object)
		return;
	if( typeof object!="object" ){
		parent.insertBefore(document.createTextNode(object), nextSibling);
		return;
	}
	if( object.nodeType ){
		parent.insertBefore(object, nextSibling);
		return;
	}
	for(var i=0, l=object.length; i<l; ++i){
		deepInsert(object[i], parent, nextSibling);
	}
}

$.html=function(){
	var result = [], operators = [];
	var placeholder = "<!---->";
	for(var i=0, l=arguments.length; i<l; ++i){
		var arg = arguments[i];
		if( arg===null || arg===undefined ) continue;
		if( typeof arg==="function" || typeof arg==="object" ){
			result.push(placeholder);
			operators.push(arg);
		}else{
			result.push(arg);
		}
	}
	
	var cTag = "div";
	var content = result.join("");
	var tagMatch = content.match(/<[a-zA-Z]+/);
	var firstMatch = tagMatch[0];
	
	if( firstMatch ){
		var firstTag = firstMatch.substring(1).toLowerCase();
		switch( firstTag ){
			case "th":
			case "td":
				cTag = "tr"; break;
			case "tr":
				cTag = "tbody"; break;
			case "tbody":
			case "thead":
			case "tfoot":
			case "caption":
				cTag = "table"; break;
			case "body":
			case "head":
				cTag = "html"; break;
		}
	}
	
	var container = document.createElement(cTag);
	container.innerHTML = content;
	
	var comments = [];
	findNodes(comments, container, 8);
	
	for(i=0, l=operators.length; i<l; ++i){
		var operator = operators[i];
		var comment = comments[i];
		if( typeof operator==="function" ){
			while( comment && comment.nodeType==8 ){
				var prev = comment;
				comment = comment.previousSibling || comment.parentNode;
				prev.parentNode.removeChild(prev);
			}
			if( comment && comment!==container)
				operator(comment);
		}else{
			deepInsert(operator, comment.parentNode, comment);
			comment.parentNode.removeChild(comment);
		}
	}
	
	return $().forEach(container.childNodes, function(node){
		this.push(node);
	});
};

})($);
