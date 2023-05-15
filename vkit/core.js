(function(global){

var _$, UNSET = {};

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

$.fn = vKit.prototype;
$.global = global;
$.data = {};
$.install = install;
$.uninstall = uninstall;

})(this);
