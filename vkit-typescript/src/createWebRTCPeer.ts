interface StreamRegistration {
	stream: MediaStream;
	remove(): void;
}

export interface WebRTCPeer {
	isConnected: boolean;
	streams: MediaStream[];
	addStream(stream: MediaStream): void;
	close(): void;
	receiveSignal(signal: WebRTCSignalMessage): void;
	removeStream(stream: MediaStream): void
	restart(): void;
	send(message: string | Blob | ArrayBuffer | ArrayBufferView | Uint8Array): void;
}

interface WebRTCPeerParams {
	bufferedAmountLowThreshold?: number;
	channelLabel?: string;
	channelOptions?: object;
	configuration?: RTCConfiguration;
	maxBufferSize?: number;
	polite?: boolean;
	retryDelay?: number;
	onClose?(): void;
	onError?(error: unknown): void;
	onMessage?(message: WebRTCMessage, label: string): void;
	onSignal?(message: WebRTCSignalMessage): void;
}

type WebRTCMessage = unknown;

type WebRTCSignalMessage = WebRTCIceCandidateSignalMessage | WebRTCSessionDescriptionMessage;

interface WebRTCIceCandidateSignalMessage {
	candidate: RTCIceCandidate | null;
}

interface WebRTCSessionDescriptionMessage {
	description: RTCSessionDescription | null;
}

declare var mozRTCIceCandidate: Function;
declare var webkitRTCIceCandidate: Function;

declare var mozRTCPeerConnection: new (configuration: RTCConfiguration | undefined) => RTCPeerConnection;
declare var webkitRTCPeerConnection: new (configuration: RTCConfiguration | undefined) => RTCPeerConnection;

declare var mozRTCSessionDescription: Function;
declare var webkitRTCSessionDescription: Function;

export function isWebRTCSupported(): boolean {
	return (
		(typeof RTCSessionDescription === "function" || typeof mozRTCSessionDescription === "function" || typeof webkitRTCSessionDescription === "function") &&
		(typeof RTCPeerConnection === "function" || typeof mozRTCPeerConnection === "function" || typeof webkitRTCPeerConnection === "function") &&
		(typeof RTCIceCandidate === "function" || typeof mozRTCIceCandidate === "function" || typeof webkitRTCIceCandidate === "function")
	);
}

function getSize(buffer: ArrayBuffer | Blob): number {
	if (buffer instanceof Blob) {
		return buffer.size;
	}

	return buffer.byteLength;
}

function createPeerConnection(configuration: RTCConfiguration | undefined): RTCPeerConnection {
	if (typeof RTCPeerConnection === "function") {
		return new RTCPeerConnection(configuration);
	}

	if (typeof webkitRTCPeerConnection === "function") {
		return new webkitRTCPeerConnection(configuration);
	}

	if (typeof mozRTCPeerConnection === "function") {
		return new mozRTCPeerConnection(configuration);
	}

	throw new Error("RTCPeerConnection is not supported");
}

function defaultValue<T extends string | number | object>(option: T | undefined, value: T): T {
	return option === undefined ? value : option;
}

export function createWebRTCPeer(params: WebRTCPeerParams): WebRTCPeer {
	var bufferedAmountLowThreshold = defaultValue(params.bufferedAmountLowThreshold, 1024 * 128);
	var channelLabel = defaultValue(params.channelLabel, "channel");
	var channelOptions = defaultValue(params.channelOptions, {ordered: false});
	var maxBufferSize = defaultValue(params.maxBufferSize, 1024 * 256);
	var configuration = params.configuration;
	var polite = !!params.polite;
	var retryDelay = defaultValue(params.retryDelay, 8);
	
	var ignoreOffer = false;
	var makingOffer = false;
	var receiveChannel: RTCDataChannel | null = null;
	var sendChannel: RTCDataChannel | null = null;
	var streamRegs: StreamRegistration[] = [];
	
	var peer: WebRTCPeer = {
		isConnected: false,
		streams: [],
		addStream: addStream,
		close: close,
		receiveSignal: receiveSignal,
		removeStream: removeStream,
		restart: restart,
		send: send
	};
	
	var pc = createPeerConnection(configuration);
	
	pc.onicecandidate = function(e): void {
		if (params.onSignal) {
			params.onSignal({
				"candidate": e.candidate
			});
		}
	};
	
	pc.oniceconnectionstatechange = function(): void {
		peer.isConnected = pc.iceConnectionState === "connected";
		
		if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
			if (!polite) {
				pc.restartIce();
			}
		} else if (pc.iceConnectionState === "connected") {
			readdStreams();
		}
		
		updateStatus();
	};
	
	pc.onsignalingstatechange = updateStatus;
	
	pc.onnegotiationneeded = function(): void {
		makingOffer = true;
		
		pc.setLocalDescription().then(function(): void {
			if (params.onSignal) {
				params.onSignal({
					"description": pc.localDescription
				});
			}
			makingOffer = false;
		}, function(error): void {
			if (params.onError) {
				params.onError(error);
			}
			makingOffer = false;
		});
	};
	
	function removeRemoteStream(stream: MediaStream): void {
		var streams = peer.streams;
		
		for (var i = streams.length; i--;) {
			if (streams[i] === stream) {
				peer.streams = streams.slice(0, i).concat(streams.slice(i + 1));
				break;
			}
		}
	}
	
	function addRemoteStream(stream: MediaStream): void {
		var streams = peer.streams;
		
		for (var i = streams.length; i--;) {
			if (streams[i] === stream) {
				return;
			}
		}
		
		peer.streams = streams.concat([stream]);
		
		stream.onremovetrack = function(e): void {
			var tracks = stream.getTracks();
			
			for (var i = tracks.length; i--;) {
				var track = tracks[i];
				
				if (track.readyState !== "ended" && !track.muted) {
					return;
				}
			}
			
			removeRemoteStream(stream);
		};
	}
	
	pc.ontrack = function(e): void {
		var n = e.streams.length;
		
		for (var i = 0; i < n; ++i) {
			addRemoteStream(e.streams[i]);
		}
	};
	
	pc.ondatachannel = function(e: RTCDataChannelEvent): void {
		if (receiveChannel) {
			receiveChannel.close();
			receiveChannel = null;
		}
		
		var rc: RTCDataChannel = e.channel;
		rc.binaryType = "arraybuffer";
		
		rc.onerror = function(e): void {
			if (params.onError) {
				params.onError(e);
			}
		};
		
		rc.onopen = function(): void {
			if (receiveChannel) {
				return;
			}
			
			receiveChannel = rc;
			updateStatus();
		};
		
		(rc as any).onclosing = function(): void {
			if (receiveChannel === rc) {
				receiveChannel = null;
				updateStatus();
			}
		};
		
		rc.onclose = function(): void {
			if (receiveChannel === rc) {
				receiveChannel = null;
				updateStatus();
			}
		};
		
		rc.onmessage = function(e: MessageEvent<any>): void {
			if (params.onMessage) {
				params.onMessage(e.data, this.label);
			}
		};
	};
	
	(pc as any).onbufferedamountlow = function(): void {
		flush();
	};
	
	(pc as any).bufferedAmountLowThreshold = bufferedAmountLowThreshold;
	
	var jsonQueue: string[] = [];
	var blobQueue: Blob[] = [];
	var sendTimeout = 0;
	
	function updateStatus(): void {
		if (
			sendChannel !== null &&
			sendChannel.readyState === "closed" &&
			!receiveChannel &&
			pc.iceConnectionState === "closed" &&
			params.onClose
		) {
			params.onClose();
		}
	}
	
	function send(message: string | Blob | ArrayBuffer | ArrayBufferView | Uint8Array): void {
		var queue = message instanceof Blob || message instanceof ArrayBuffer || message instanceof Uint8Array ? blobQueue : jsonQueue;
		queue.push(message as never);
		clearTimeout(sendTimeout);
		sendTimeout = setTimeout(flush, retryDelay);
	}
	
	function flush(): void {
		clearTimeout(sendTimeout);
		sendTimeout = 0;
		
		while (jsonQueue.length > 0) {
			if (sendChannel && sendChannel.readyState === "open" && sendChannel.bufferedAmount <= maxBufferSize) {
				sendChannel.send(jsonQueue[0]);
				jsonQueue.shift();
			} else {
				break;
			}
		}
		
		while (blobQueue.length > 0) {
			if (sendChannel && sendChannel.readyState === "open" && sendChannel.bufferedAmount + getSize(blobQueue[0]) <= maxBufferSize) {
				sendChannel.send(blobQueue[0]);
				blobQueue.shift();
			} else {
				break;
			}
		}
		
		if (jsonQueue.length > 0 || blobQueue.length > 0) {
			sendTimeout = setTimeout(flush, retryDelay);
		}
	}
	
	function restart(): void {
		if (sendChannel && sendChannel.readyState !== "open" && sendChannel.readyState !== "connecting") {
			sendChannel.close();
			sendChannel = null;
			createSendChannel(channelLabel, channelOptions);
		}
		
		if (receiveChannel && receiveChannel.readyState !== "open" && receiveChannel.readyState !== "connecting") {
			receiveChannel.close();
			receiveChannel = null;
		}
	}
	
	function createSendChannel(label: string, options: RTCDataChannelInit): void {
		if (sendChannel !== null) {
			return;
		}
		
		var sc = pc.createDataChannel(label, options);
		sc.binaryType = "arraybuffer";
		
		sc.onerror = function(e): void {
			if (params.onError) {
				params.onError(e);
			}
		};
		
		sc.onopen = function(): void {
			updateStatus();
			flush();
		};
		
		(sc as any).onclosing = function(): void {
			updateStatus();
			sendChannel = null;
			createSendChannel(label, options);
		};
		
		sc.onclose = updateStatus;
		
		sendChannel = sc;
	}
	
	function readdStreams(): void {
		var n = streamRegs.length;
		
		for (var i = 0; i < n; ++i) {
			var reg = streamRegs[i];
			reg.remove();
			reg.remove = addStreamRaw(reg.stream);
		}
	}
	
	function addStreamRaw(stream: MediaStream): () => void {
		var senders: RTCRtpSender[] = [];
		
		stream.getTracks().forEach(function(track: MediaStreamTrack): void {
			try {
				var sender = pc.addTrack(track, stream);
				senders.push(sender);
				
				track.addEventListener("ended", function(): void {
					pc.removeTrack(sender);
				});
			} catch (ex) {
			}
		});
		
		return function(): void {
			if (pc.signalingState !== "closed") {
				var n = senders.length;
				
				for (var i = 0; i < n; ++i) {
					pc.removeTrack(senders[i]);
				}
			}
		};
	}
	
	function addStream(stream: MediaStream): void {
		for (var i = streamRegs.length; i--;) {
			if (streamRegs[i].stream === stream) {
				return;
			}
		}
		
		var removeStreamRaw = addStreamRaw(stream);
		
		streamRegs.push({
			stream: stream,
			remove: removeStreamRaw
		});
	}
	
	function removeStream(stream: MediaStream): void {
		for (var i = streamRegs.length; i--;) {
			var reg = streamRegs[i];
			
			if (reg.stream === stream) {
				reg.remove();
				streamRegs.splice(i, 1);
				break;
			}
		}
	}
	
	function setRemoteDescription(description: RTCSessionDescriptionInit): void {
		pc.setRemoteDescription(description).then(function(): void {
			if (description.type === "offer") {
				pc.setLocalDescription().then(function(): void {
					if (params.onSignal) {
						params.onSignal({
							"description": pc.localDescription
						});
					}
				}, function(error): void {
					if (params.onError) {
						params.onError(error);
					}
				});
			}
		}, function(error): void {
			if (params.onError) {
				params.onError(error);
			}
		});
	}
	
	function receiveSignal(signal: WebRTCSignalMessage): void {		
		if ("description" in signal && signal.description !== null) {
			var description = signal.description;
			var offerCollision = description.type === "offer" && (makingOffer || pc.signalingState !== "stable");
			ignoreOffer = !polite && offerCollision;
			
			if (ignoreOffer) {
				return;
			}
			
			setRemoteDescription(description);
		} else if ("candidate" in signal && pc.remoteDescription) {
			pc.addIceCandidate(signal.candidate as RTCIceCandidate).then(null, function(error): void {
				if (!ignoreOffer && params.onError) {
					params.onError(error);
				}
			});
		}
	}
	
	function close(): void {
		clearTimeout(sendTimeout);

		if (sendChannel !== null) {
			sendChannel.close();
		}
		
		if (receiveChannel !== null) {
			receiveChannel.close();
			receiveChannel = null;
		}
		
		if (pc.signalingState !== "closed") {
			pc.close();

			if (params.onClose) {
				params.onClose();
			}
		}
	}
	
	createSendChannel(channelLabel, channelOptions);
	
	return peer;
}
