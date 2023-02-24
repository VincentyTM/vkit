(function($, window){

var createObservable = $.observable;
var delay = typeof Promise === "function" && typeof Promise.resolve === "function" ? function(fn){
	Promise.resolve().then(fn);
} : setTimeout;

function selectElement(el, win, doc){
	if( el.select ){
		el.select();
	}else if( doc.selection ){
		var range = doc.body.createTextRange();
		range.moveToElementText(el);
		range.select();
	}else if( win.getSelection ){
		var range = doc.createRange();
		range.selectNode(el);
		win.getSelection().removeAllRanges();
		win.getSelection().addRange(range);
	}
}

function writeToClipboard(text, win){
	if(!win){
		win = window;
	}
	var doc = win.document;
	var nav = win.navigator;
	var resolve = createObservable();
	var reject = createObservable();
	function exec(){
		try{
			var container = doc.body || doc.documentElement;
			var textarea = doc.createElement("textarea");
			textarea.value = text;
			container.appendChild(textarea);
			textarea.select();
			doc.execCommand("copy");
			container.removeChild(textarea);
			delay(resolve);
		}catch(ex){
			delay(function(){ reject(ex) });
		}
	}
	if( text.nodeType ){
		try{
			selectElement(text, win, doc);
			doc.execCommand("copy");
			delay(resolve);
		}catch(ex){
			delay(function(){ reject(ex) });
		}
	}else if( nav.clipboard ){
		nav.clipboard.writeText(text).then(resolve, exec);
	}else{
		exec();
	}
	return {
		then: function(onResolve, onReject){
			if( onResolve ) resolve.subscribe(onResolve);
			if( onReject ) reject.subscribe(onReject);
		}
	};
}

$.copy = writeToClipboard;

})($, window);
