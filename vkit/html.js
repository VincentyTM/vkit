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
	if( typeof object !== "object" ){
		parent.insertBefore(document.createTextNode(object), nextSibling);
		return;
	}
	if( object.nodeType ){
		parent.insertBefore(object, nextSibling);
		return;
	}
	var n = object.length;
	if( typeof n === "number" ){
		for(var i=0; i<n; ++i){
			deepInsert(object[i], parent, nextSibling);
		}
		return;
	}
	if( typeof object.text === "function" ){
		deepInsert(object.text(), parent, nextSibling);
		return;
	}
	if( typeof object.render === "function" ){
		deepInsert(object.render(), parent, nextSibling);
		return;
	}
}

function deepInsertFragment(object, parent, nextSibling){
	if( document.createDocumentFragment ){
		var fragment = document.createDocumentFragment();
		function insert(node){
			fragment.appendChild(node);
		}
		deepInsert(object, {insertBefore: insert}, nextSibling);
		parent.insertBefore(fragment, nextSibling);
	}else{
		deepInsert(object, parent, nextSibling);
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
	
	var comments = [];
	findNodes(comments, container, 8);
	
	for(i=0, l=operators.length; i<l; ++i){
		var operator = operators[i];
		var comment = comments[i];
		
		if(!comment){
			throw new Error("Some object or function could not be inserted");
		}
		
		if( typeof operator==="function" ){
			var ref = comment.previousSibling || comment.parentNode;
			comment.parentNode.removeChild(comment);
			if( ref && ref !== container ){
				operator(ref);
			}
		}else{
			deepInsertFragment(operator, comment.parentNode, comment);
			comment.parentNode.removeChild(comment);
		}
	}
	
	return $().forEach(container.childNodes, function(node){
		this.push(node);
	});
};

})($);
