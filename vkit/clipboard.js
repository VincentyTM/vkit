(function($, document, navigator){

var createObservable = $.observable;
var delay = typeof Promise === "function" && typeof Promise.resolve === "function" ? function(fn){
	Promise.resolve().then(fn);
} : setTimeout;

function selectElement(el){
	if( el.select ){
		el.select();
	}else if( document.selection ){
		var range = document.body.createTextRange();
		range.moveToElementText(el);
		range.select();
	}else if( window.getSelection ){
		var range = document.createRange();
		range.selectNode(el);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}
}

function writeToClipboard(text){
	var resolve = $.observable();
	var reject = $.observable();
	function exec(){
		try{
			var container = document.body || document.documentElement;
			var textarea = document.createElement("textarea");
			textarea.value = text;
			container.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			container.removeChild(textarea);
			delay(resolve);
		}catch(ex){
			delay(function(){ reject(ex) });
		}
	}
	if( text.nodeType ){
		try{
			selectElement(text);
			document.execCommand("copy");
			delay(resolve);
		}catch(ex){
			delay(function(){ reject(ex) });
		}
	}else if( navigator.clipboard ){
		navigator.clipboard.writeText(text).then(resolve, exec);
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

})($, document, navigator);
