(function(global){

var _$, UNSET = {};

function vKit(args){
	var n = this.length = args.length;
	for(var i=0; i<n; ++i){
		this[i] = args[i];
	}
}

function $(){
	return new vKit(arguments);
}

function hasOwnProperty(e, p){
	var o;p=String(p);return p in e&&(o=e.__proto__||e.constructor.prototype,!(p in o)||e[p]!==o[p]);
}

function noConflict(){
	if( global.$ === $ ){
		if( _$ === UNSET ){
			delete global.$;
		}else{
			global.$ = _$;
		}
	}
	return $;
}

if( global.$ !== $ ){
	_$ = hasOwnProperty(global, "$") ? global.$ : UNSET;
	global.$ = $;
}

$.data = null;
$.fn = vKit.prototype;
$.global = global;
$.noConflict = noConflict;

})(this);
