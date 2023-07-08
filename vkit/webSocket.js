(function($){

var createEmitter = $.emitter;
var createState = $.state;
var update = $.update;

function createWebSocket(url, options){
	var ws = null;
	var queue = [];
	var isOpen = createState(false);
	var emitter = createEmitter({
		socket: ws,
		queue: queue,
		isOpen: isOpen,
		setURL: setURL,
		open: open,
		close: close,
		send: send
	});
	var binaryType = (options ? options.binaryType : null) || "blob";

	function onMessage(e){
		emitter.emit(e.data);
	}

	function onError(err){
		close();
		emitter.throwError(err);
		update();
	}

	function onClose(e){
		close();
		isOpen.set(false);
		isOpen.event = e;
		update();
	}

	function onOpen(e){
		isOpen.set(true);
		isOpen.event = e;
		var n = queue.length;
		if( n ){
			var q = queue.splice(0, n);
			for(var i=0; i<n; ++i){
				send(q[i]);
			}
		}
		update();
	}

	function open(){
		if(!ws){
			if( typeof WebSocket !== "function" ){
				throw new ReferenceError("WebSocket is not supported");
			}
			ws = new WebSocket(url);
			ws.onopen = onOpen;
			ws.onmessage = onMessage;
			ws.onclose = onClose;
			ws.onerror = onError;
			ws.binaryType = binaryType;
			emitter.socket = ws;
		}
		return this;
	}

	function close(){
		if( ws ){
			ws.onmessage = null;
			ws.onopen = null;
			ws.onclose = null;
			ws.onerror = null;
			ws.close();
			ws = null;
			emitter.socket = null;
			isOpen.set(false);
		}
		return this;
	}

	function setURL(newURL){
		if( url !== newURL ){
			url = newURL;
			if( ws ){
				close();
				open();
			}
		}
		return this;
	}

	function send(message){
		if( isOpen.get() && ws && ws.readyState === 1 ){
			ws.send(message);
		}else{
			queue.push(message);
		}
		return this;
	}

	return emitter;
}

$.webSocket = createWebSocket;

})($);
