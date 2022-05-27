(function($, g){

var createObservable = $.observable;
var render = $.render;

var RTCSessionDescription = g.RTCSessionDescription || g.mozRTCSessionDescription || g.RTCSessionDescription;
var RTCPeerConnection = g.RTCPeerConnection || g.mozRTCPeerConnection || g.webkitRTCPeerConnection;
var RTCIceCandidate = g.RTCIceCandidate || g.mozRTCIceCandidate || g.RTCIceCandidate;

function createPeer(peerConfig, peerOptions, manipulateSDP){
	if(!peerOptions){
		peerOptions = defaultPeerOptions;
	}
	var onError = createObservable();
	var handleStreams = createObservable();
	var sendSignal = createObservable();
	var log = createObservable();
	var onOpen = createObservable();
	var onClose = createObservable();
	var onMessage = createObservable();
	var receiveChannel;
	var sendChannel;
	var negotiated = false;
	var closed = false;
	var opened = false;
	
	function onOpenOnce(){
		if(!opened){
			opened = true;
			onOpen();
		}
	}
	
	function onCloseOnce(){
		if(!closed){
			closed = true;
			onClose();
		}
	}
	
	function receiveSignal(signal){
		if(!signal){
			return;
		}
		switch( signal.type ){
			case "offer": createAnswer(signal.data); break;
			case "answer": finishNegotiation(signal.data); break;
			case "ice":
				var candidate = signal.data;
				peer.addIceCandidate( new RTCIceCandidate(candidate) ).then(null, onError);
				break;
		}
	}
	
	function send(message){
		if( sendChannel ){
			if( sendChannel.readyState === "open" ){
				sendChannel.send(message);
			}else{
				onError("Send channel is in state " + sendChannel.readyState);
			}
		}else{
			onError("No send channel while sending message");
		}
		return this;
	}
	
	function close(){
		if( sendChannel ){
			sendChannel.close();
		}
		if( receiveChannel ){
			receiveChannel.close();
		}
		peer.close();
		return this;
	}

	function addTrack(track, stream){
		negotiated = false;
		var sender = peer.addTrack(track, stream);
		return function(){
			negotiated = false;
			if( peer.signalingState !== "closed" ){
				peer.removeTrack(sender);
			}
		};
	}
	
	function addStream(stream){
		negotiated = false;
		var senders = [];
		stream.getTracks().forEach(function(track){
			senders.push( peer.addTrack(track, stream) );
		});
		return function(){
			negotiated = false;
			senders.forEach(function(sender){
				if( peer.signalingState !== "closed" ){
					peer.removeTrack(sender);
				}
			});
		};
	}
	
	function start(){
		peer.onnegotiationneeded = onNegotiationNeeded;
		onNegotiationNeeded();
		return this;
	}
	
	function onNegotiationNeeded(){
		if(!negotiated){
			negotiated = true;
			createOffer();
		}
	}
	
	function createOffer(){
		peer.createOffer().then(function(offer){
			if( manipulateSDP ){
				manipulateSDP(offer, false);
			}
			peer.setLocalDescription(offer).then(function(){
				sendSignal({
					"type": "offer",
					"data": offer
				});
			}, onError);
		}, onError);
	}
		
	function createAnswer(offer){
		peer.setRemoteDescription( new RTCSessionDescription(offer) ).then(function(){
			return peer.createAnswer();
		}).then(function(answer){
			if( manipulateSDP ){
				manipulateSDP(answer, true);
			}
			peer.setLocalDescription(answer).then(function(){
				sendSignal({
					"type": "answer",
					"data": answer
				});
			}, onError);
		}, onError);
	}

	function finishNegotiation(answer){
		peer.setRemoteDescription( new RTCSessionDescription(answer) );
	}

	var peer = new RTCPeerConnection(peerConfig, peerOptions);
	
	peer.ontrack = function(e){
		log("OnTrack event fired");
		handleStreams(e.streams);
		render();
	};
	
	peer.ondatachannel = function(e){
		receiveChannel = e.channel;
		receiveChannel.binaryType = "arraybuffer";
		receiveChannel.onopen = function(){
			log("Receive channel is open");
			start();
			onOpenOnce();
			render();
		};
		receiveChannel.onclose = function(){
			log("Receive channel is closed");
			close();
			onCloseOnce();
			render();
		};
		receiveChannel.onerror = function(error){
			onError(error);
			render();
		};
		receiveChannel.onmessage = function(e){
			onMessage(e.data);
			render();
		};
		log("OnDataChannel event fired");
	};
	
	peer.onconnectionstatechange = function(){
		var state = this.connectionState;
		if( state === "disconnected" || state === "failed" || state === "closed" ){
			if( receiveChannel ){
				receiveChannel.close();
			}
			this.close();
			onCloseOnce();
		}
		render();
	};
	
	peer.oniceconnectionstatechange = function(){
		var state = this.iceConnectionState;
		if( state === "failed" || state === "disconnected" ){
			if( peer.restartIce ){
				peer.restartIce();
			}
		}else{
			log("IceConnectionState changed to " + this.iceConnectionState);
		}
	};
	
	peer.onicecandidate = function(e){
		var candidate = e.candidate;
		if( candidate ){
			sendSignal({
				"type": "ice",
				"data": candidate
			});
		}
	};

	function createSendChannel(){
		if( sendChannel ){
			sendChannel.close();
		}
		if( peer.signalingState === "closed" ){
			return;
		}
		sendChannel = peer.createDataChannel("sendDataChannel", {
			ordered: true
		});
		sendChannel.binaryType = "arraybuffer";
		sendChannel.onopen = function(){
			log("Send channel open");
			render();
		};
		sendChannel.onclose = function(){
			log("Send channel closed");
			sendChannel = null;
			createSendChannel();
			render();
		};
		sendChannel.onerror = onError;
	}
	
	createSendChannel();
	
	return {
		connection: peer,
		onLog: log,
		onError: onError,
		onStreams: handleStreams,
		onSignal: sendSignal,
		onOpen: onOpen,
		onClose: onClose,
		onMessage: onMessage,
		signal: receiveSignal,
		addTrack: addTrack,
		addStream: addStream,
		start: start,
		send: send,
		close: close
	};;
}

var defaultPeerOptions = {
	"optional": [
		{"DtlsSrtpKeyAgreement": true}
	]
};

$.webrtcPeer = createPeer;
$.webrtcPeer.isSupported = !!(RTCSessionDescription && RTCPeerConnection && RTCIceCandidate);

})($, this);
