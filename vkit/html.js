(function($, undefined){

var group = $.group;
var append = $.append;
var setProps = $.setProps;

function findNodes(result, container, type, count){
	if( container.nodeType === type ){
		result.push(container);
		--count;
	}
	
	for(var child = container.firstChild; 0 < count && child; child = child.nextSibling){
		count = findNodes(result, child, type, count);
	}
	
	return count;
}

function deepInsert(children, parent, nextSibling, ref){
	function insert(node){
		parent.insertBefore(node, nextSibling);
	}
	append({appendChild: insert}, children, setProps, ref);
}

function html(){
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
		findNodes(comments, container, 8, n);
		
		for(i=0; i<n; ++i){
			var operator = operators[i];
			var comment = comments[i];
			
			if(!comment){
				throw new Error("Some object or function could not be inserted");
			}
			
			var ref = comment.previousSibling || comment.parentNode;
			if( ref === container ){
				ref = null;
			}
			deepInsert(operator, comment.parentNode, comment, ref);
			comment.parentNode.removeChild(comment);
		}
	}
	
	return group(container.childNodes);
}

$.html = html;

})($);
