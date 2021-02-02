(function($){

$.createText=function(text){
	return $(document.createTextNode(text));
};

$.create=function(tag, count){
	var sel=$();
	if( typeof count!="number" )
		count=1;
	for(var i=0; i<count; ++i)
		sel.push(document.createElement(tag));
	return sel;
};

$.fn.append=function(){
	for(var i=0, e, l=arguments.length; i<l; ++i){
		if( null!==(e=arguments[i]) )
			typeof e!=="object"
				? this[0].appendChild(document.createTextNode(e))
				: e.nodeType
				? this[0].appendChild(e)
				: this.append.apply(this, $.fn.toArray.call(e));
	}
	return this;
};

$.fn.add=function(tag, count){
	var sel=$();
	sel.end=this;
	if( typeof count!="number" )
		count=1;
	for(var j=0, l=this.length; j<l; ++j){
		var parent=this[j];
		for(var i=0; i<count; ++i){
			var ch=parent.ownerDocument.createElement(tag);
			parent.appendChild(ch);
			sel.push(ch);
		}
	}
	return sel;
};

$.fn.addText=function(text){
	for(var j=this.length, e; j--;)
		this[j].appendChild( document.createTextNode(text) );
	return this;
};

$.fn.html=function(html){
	for(var i=this.length; i--;)
		this[i].innerHTML=html;
	return this;
};

$.fn.remove=function(){
	for(var i=this.length, p, c; i--;){
		c=this[i];
		p=c.parentNode;
		if( p )
			p.removeChild(c);
	}
	return this;
};

$.fn.empty=function(){
	for(var i=this.length, e, ch; i--;){
		e=this[i];
		ch=e.childNodes;
		while( ch.length>0 )
			e.removeChild(ch[0]);
	}
	return this;
};

$.fn.id=function(){
	var sel=$(); sel.end=this;
	for(var j=this.length, doc; j--;){
		doc=this[j];
		for(var i=0, l=arguments.length; i<l; ++i){
			var element=doc.getElementById(arguments[i]);
			if( element )
				sel.push(element);
		}
	}
	return sel;
};

$.fn.find=function(tag){
	var sel=$(); sel.end=this;
	for(var j=this.length, container; j--;){
		container=this[j].getElementsByTagName(tag);
		for(var i=0, l=container.length; i<l; ++i)
			sel.push(container[i]);
	}
	return sel;
};

$.fn.document=function(){
	var sel=$();
	sel.end=this;
	for(var i=this.length, e; i--;){
		e=this[i];
		if( e.contentWindow )
			e=e.contentWindow;
		if( e.document )
			sel.push(e.document);
	}
	return sel;
};

$.fn.addClass=function(cname){
	for(var e=this.length, cns, cnsl, j; e--;){
		cns=this[e].className.split(" ");
		cnsl=cns.length;
		j=0;
		while( j<cnsl && cns[j]!=cname )
			++j;
		if( j>=cnsl )
			cns.push(cname);
		this[e].className=cns.join(" ");
	}
	return this;
};

$.fn.removeClass=function(cname){
	for(var i=this.length, e; i--;){
		e=this[i];
		e.className=e.className.replace(new RegExp("\\b"+cname.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')+"\\b", "g"), "");
	}
	return this;
};

$.fn.hasClass=function(cname){
	for(var i=this.length, cns, cnsl, j; i--;){
		cns=this[i].className.split(" ");
		cnsl=cns.length;
		j=0;
		while( j<cnsl && cns[j]!=cname )
			++j;
		if( j>=cnsl )
			return false;
	}
	return true;
};

$.fn.withClass=function(cname){
	var sel=$();
	sel.end=this;
	for(var i=this.length; i--;){
		if(~(" "+this[i].className+" ").indexOf(" "+cname+" "))
			sel.push(this[i]);
	}
	return sel;
};

$.fn.style=function(css){
	var sel=$(); sel.end=this;
	for(var i=this.length, doc, head, style; i--;){
		doc=this[i];
		head=doc.getElementsByTagName("head")[0];
		style=doc.createElement("style");
		style.type="text/css";
		head.appendChild(style);
		style.styleSheet
			? (style.styleSheet.cssText=css)
			: style.appendChild( doc.createTextNode(css) );
		sel.push(style);
	}
	return sel;
};

$.fn.css=function(properties){
	for(var i=this.length, s; i--;){
		s=this[i].style;
		for(var prop in properties)
			s[prop]=properties[prop];
	}
	return this;
};

})($);
