(function($, g){

var emitLog=function(){}, emitError=console.error;
var RTCSessionDescription = g.RTCSessionDescription || g.mozRTCSessionDescription || g.RTCSessionDescription;
var RTCPeerConnection = g.RTCPeerConnection || g.mozRTCPeerConnection || g.webkitRTCPeerConnection;
var RTCIceCandidate = g.RTCIceCandidate || g.mozRTCIceCandidate || g.RTCIceCandidate;
var supported=RTCSessionDescription && RTCPeerConnection && RTCIceCandidate;

var defaultOptions={
	"optional": [
		{"DtlsSrtpKeyAgreement": true}
	]
};

function createPeer(rtcInterface, config, options){
	var receiveChannel;
	var peer=new RTCPeerConnection(config, options || defaultOptions);
	peer.ontrack=function(e){
		rtcInterface.handleStreams(e.streams);
	};
	peer.ondatachannel=function(e){
		var receiveChannel=e.channel;
		receiveChannel.onopen=function(){
			setNegotiationHandler(peer, rtcInterface);
			rtcInterface.open();
			emitLog("Receive channel open!");
		};
		receiveChannel.onclose=function(){
			rtcInterface.close();
			emitLog("Receive channel closed...");
		};
		receiveChannel.onerror=emitError;
		receiveChannel.onmessage=function(e){
			rtcInterface.receiveText(e.data);
		};
		emitLog("Receive channel received!");
	};
	peer.onconnectionstatechange=function(e){
		switch( this.connectionState ){
			case "disconnected": case "failed": case "closed":
				receiveChannel && receiveChannel.close();
				this.close();
				break;
		}
	};
	peer.oniceconnectionstatechange=function(){
		switch( this.iceConnectionState ){
			case "failed":
				peer.restartIce();
				break;
			default:
				emitLog("Changed to ", this.iceConnectionState);
		}
	};
	peer.onicecandidate=function(e){
		if( e.candidate ){
			rtcInterface.sendSignal("ice", e.candidate);
		}
	};
	return peer;
}

function setNegotiationHandler(peer, rtcInterface){
	peer.onnegotiationneeded=function(){
		if(!rtcInterface.negotiated){
			rtcInterface.negotiated=true;
			createOffer(this, rtcInterface);
		}
	};
	if(!rtcInterface.negotiated){
		rtcInterface.negotiated=true;
		createOffer(peer, rtcInterface);
	}
}

function createSendChannel(peer){
	var sendChannel=peer.createDataChannel("sendDataChannel", {
		ordered: true
	});
	sendChannel.onopen=function(){ emitLog("Send channel open"); };
	sendChannel.onclose=function(){ emitLog("Send channel closed"); };
	sendChannel.onerror=emitError;
	return sendChannel;
}

function createOffer(peer, rtcInterface){
	peer.createOffer().then(function(offer){
		peer.setLocalDescription(offer).then(function(){
			rtcInterface.sendSignal("offer", offer);
		}, emitError);
	}, emitError);
}

function addIce(peer, remoteICE){
	peer.addIceCandidate( new RTCIceCandidate(remoteICE) ).then(null, emitError);
}

function createAnswer(peer, offer, rtcInterface){
	peer.setRemoteDescription( new RTCSessionDescription(offer) ).then(function(){
		peer.createAnswer().then(function(answer){
			peer.setLocalDescription(answer).then(function(){
				rtcInterface.sendSignal("answer", answer);
			}, emitError);
		}, emitError);
	}, emitError);
}

function finishNegotiation(peer, answer){
	peer.setRemoteDescription( new RTCSessionDescription(answer) ).then(function(e){
		emitLog("SDP negotiation done");
	}, emitError);
}

function RTCInterface(sendSignal, streamHandler, config, options){
	var instance=this;
	var rtcInterface={
		handleStreams: streamHandler || function(){},
		sendSignal: function(type, data){
			emitLog("Signal: ", type, data);
			sendSignal(JSON.stringify({
				type: type,
				data: data
			}), type);
		},
		open: function(){
			instance.onopen && instance.onopen();
		},
		close: function(){
			instance.onclose && instance.onclose();
		},
		receiveText: function(msg){
			instance.onmessage && instance.onmessage(msg);
		},
		negotiated: false
	};
	var peer=createPeer(rtcInterface, config, options);
	var sendChannel=createSendChannel(peer);
	this.send=function(msg){
		if( sendChannel.readyState==="open" ){
			sendChannel.send(msg);
		}
		return this;
	};
	this.close=function(){
		sendChannel.close();
		peer.close();
		return this;
	};
	this.signal=function(signal){
		if(!signal){
			return;
		}
		try{
			var msg=JSON.parse(signal);
			switch( msg.type ){
				case "offer": createAnswer(peer, msg.data, rtcInterface); break;
				case "answer": finishNegotiation(peer, msg.data); break;
				case "ice": addIce(peer, msg.data); break;
			}
		}catch(err){
			emitError(err);
		}
		return this;
	};
	this.start=function(){
		setNegotiationHandler(peer, rtcInterface);
		return this;
	};
	var senders=[];
	this.addTracks=function(tracks, stream){
		rtcInterface.negotiated=false;
		tracks.forEach(function(track){
			senders.push( peer.addTrack(track, stream) );
		});
		return this;
	};
	this.removeTracks=function(){
		rtcInterface.negotiated=false;
		while( senders.length ){
			peer.removeTrack( senders.pop() );
		}
		return this;
	};
}

$.rtc=function(sendSignal, streamHandler, config, options){
	return new RTCInterface(sendSignal, streamHandler, config, options);
};

})($, this);
