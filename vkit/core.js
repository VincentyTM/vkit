(function(global){

"use strict"; var _$, UNSET={};

function vKit(args){
	this.end = this;
	var n = this.length = args.length;
	for(var i=0; i<n; ++i){
		this[i] = args[i];
	}
}

function $(){
	return new vKit(arguments);
}

if( typeof module === "object" ){
	module.exports = $;
}

install();

function hasOwnProperty(e, p){
	var o;p=String(p);return p in e&&(o=e.__proto__||e.constructor.prototype,!(p in o)||e[p]!==o[p]);
}

function install(){
	_$ = hasOwnProperty(global, "$") ? global.$ : UNSET;
	global.$ = $;
	return $;
}

function uninstall(){
	if( _$ === UNSET ){
		delete global.$;
	}else{
		global.$ = _$;
	}
	return $;
}

function push(){
	var n = arguments.length;
	for(var i=0; i<n; ++i){
		this[this.length++] = arguments[i];
	}
	return this;
}

function pop(){
	var item = this[--this.length];
	delete this[this.length];
	return item;
}

function toArray(){
	var n = this.length;
	var a = new Array(n);
	for(var i=0; i<n; ++i){
		a[i] = this[i];
	}
	return a;
}

function each(fn){
	var n = this.length;
	for(var i=0; i<n; ++i){
		if( fn.call(this, this[i], i) === false ){
			break;
		}
	}
	return this;
}

function forEach(array, fn){
	var n = this.length;
	for(var i=0; i<n; ++i){
		if( fn.call(this, array[i], i, array) === false ){
			break;
		}
	}
	return this;
}

function on(key, callback){
	key = "on" + key;
	var n = this.length;
	for(var i=0; i<n; ++i){
		var item = this[i], before = item[key];
		item[key] = typeof before === "function" ? function(){
			before.apply(this, arguments);
			return callback.apply(this, arguments);
		} : callback;
	}
	return this;
}
$.fn = vKit.prototype;
$.global = global;
$.version = "1.0.7";
$.data = {};
$.install = install;
$.uninstall = uninstall;
$.fn.push = push;
$.fn.pop = pop;
$.fn.toArray = toArray;
$.fn.each = each;
$.fn.forEach = forEach;
$.fn.on = on;

})(this);
