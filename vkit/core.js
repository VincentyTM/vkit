(function(global){

"use strict"; var _$, UNSET={};

function vKit(args){
	this.end=this;
	for(var i=0, l=this.length=args.length; i<l; ++i){
		this[i]=args[i];
	}
}

function $(){
	return new vKit(arguments);
}

if( typeof module=="object" ){
	module.exports=$;
}

$.fn=vKit.prototype;
$.global=global;
$.version="1.0.7";

$.own=function(e,p){
	var o;p=String(p);return p in e&&(o=e.__proto__||e.constructor.prototype,!(p in o)||e[p]!==o[p]);
};

$.install=function(){
	_$=$.own(global, "$") ? global.$ : UNSET;
	global.$=$;
	return $;
};

$.uninstall=function(){
	if( _$===UNSET ){
		delete global.$;
	}else{
		global.$=_$;
	}
	return $;
};

$.fn.push=function(){
	for(var i=0, l=arguments.length; i<l; ++i){
		this[this.length++]=arguments[i];
	}
	return this;
};

$.fn.pop=function(){
	var item=this[--this.length];
	delete this[this.length];
	return item;
};

$.fn.toArray=function(){
	var a=[];
	for(var i=0, l=this.length; i<l; ++i){
		a.push(this[i]);
	}
	return a;
};

$.fn.each=function(fn){
	for(var i=0, l=this.length; i<l; ++i){
		if( fn.call(this, this[i], i)===false ){
			break;
		}
	}
	return this;
};

$.fn.forEach=function(array, fn){
	for(var i=0, l=array.length; i<l; ++i){
		if( fn.call(this, array[i], i, array)===false ){
			break;
		}
	}
	return this;
};

$.fn.on=function(key, callback){
	key="on"+key;
	for(var i=0; i in this; ++i){
		var item=this[i], before=item[key];
		item[key]=typeof before=="function" ? function(){
			before.apply(this, arguments);
			return callback.apply(this, arguments);
		} : callback;
	}
	return this;
};

$.fn.extend=function(data){
	for(var i=0; i in this; ++i){
		var item=this[i]; for(var key in data){
			item[key]=data[key];
		}
	}
	return this;
};

$.install();

})(this);
