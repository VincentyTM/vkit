(function($, document, undefined){

var group = $.group;
var insert = $.insert;
var bind = $.bind;

function findNodes(result, container, type, value, count){
	if( container.nodeType === type && container.nodeValue === value ){
		result.push(container);
		--count;
	}
	
	for(var child = container.firstChild; 0 < count && child; child = child.nextSibling){
		count = findNodes(result, child, type, value, count);
	}
	
	return count;
}

function html(){
	var result = [], operators = [];
	var placeholder = "<!---->";
	for(var i=0, l=arguments.length; i<l; ++i){
		var arg = arguments[i];
		if( arg === null || arg === undefined ) continue;
		var type = typeof arg;
		if( type === "string" ){
			result.push(arg);
			if( l > 1 ){
				var index = arg.indexOf(placeholder);
				while( index !== -1 ){
					operators.push(document.createComment(""));
					index = arg.indexOf(placeholder, index + placeholder.length);
				}
			}
		}else if( type === "number" || type === "bigint" ){
			result.push(arg);
		}else if( type === "function" || type === "object" ){
			result.push(placeholder);
			operators.push(arg);
		}
	}
	
	var cTag = "div";
	var content = result.join("");
	var tagMatch = content.match(/<[a-zA-Z0-9\-]+/);
	if( tagMatch && tagMatch.length ){
		var firstTag = tagMatch[0].substring(1).toLowerCase();
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
	
	var n = operators.length;
	if( n ){
		var comments = [];
		findNodes(comments, container, 8, "", n);
		
		for(i=0; i<n; ++i){
			var operator = operators[i];
			var comment = comments[i];
			
			if(!comment){
				throw new Error("Some object or function could not be inserted");
			}
			
			var context = comment.previousSibling || comment.parentNode;
			if( context === container ){
				context = null;
			}
			insert(operator, comment, context, bind);
			comment.parentNode.removeChild(comment);
		}
	}
	
	return group(container.childNodes);
}

$.html = html;

})($, document);
