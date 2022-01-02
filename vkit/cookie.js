(function($, document){

function Cookie(name){
	this.name=name;
	this.value="";
	this.expiry=null;
}

Cookie.prototype.get=Cookie.prototype.toString=function(){
	var cookies=";"+document.cookie.replace(/\s/g, "");
	var search=";"+encodeURIComponent(this.name)+"=";
	var offset=cookies.indexOf(search);
	if(~offset){
		offset+=search.length;
		var end=cookies.indexOf(";", offset);
		if( end==-1 ){
			end=cookies.length;
		}
		return this.value=decodeURIComponent(cookies.substring(offset, end));
	}
	return "";
};

Cookie.prototype.set=function(value){
	this.value=value;
	document.cookie=( encodeURIComponent(this.name)+"="+encodeURIComponent(this.value)+"; "+(this.expiry===null?"":"expires="+this.expiry.toUTCString()+"; ")+"path=/" );
	return this;
};

Cookie.prototype.remove=function(){
	return this.expires(0).set("");
};

Cookie.prototype.expires=function(expiry){
	if( expiry===null ){
		this.expiry=null;
	}else{
		this.expiry=new Date();
		this.expiry.setTime(expiry);
	}
	return this;
};

$.cookie=function(name){
	return new Cookie(name);
};

$.cookie.each=function(handler){
	var ca=document.cookie.replace(/\s/g, "").split(";");
	for(var i=0, l=ca.length; i<l; ++i){
		var c=ca[i], e=c.indexOf("=");
		var cookie=$.cookie(decodeURIComponent(c.substring(0,e)));
		cookie.value=decodeURIComponent(c.substring(e+1));
		handler(cookie);
	}
	return this;
};

})($, document);
