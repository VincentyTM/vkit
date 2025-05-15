import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

type WebSocketBinaryType = "arraybuffer" | "blob";

type WebSocketMessage = string | ArrayBufferLike | Blob | ArrayBufferView;

interface WebSocketClient<U extends WebSocketMessage> {
	/**
	 * A read-only signal which tells whether the WebSocket client
	 * is successfully connected to the server.
	 */
	readonly isOpen: Signal<boolean>;

	/**
	 * (Re)opens the connection.
	 * It can be used to reactivate a WebSocket connection with a user event, for example.
	 * Calling it multiple times has no effect.
	 * 
	 * It cannot be called after the WebSocket client has been destroyed.
	 */
	connect(): void;

	/**
	 * Sends a message to the WebSocket server.
	 * If the connection is not open, the message is queued and reconnection is attempted.
	 * 
	 * It cannot be called after the WebSocket client has been destroyed.
	 */
	send(message: U): void;
}

interface WebSocketParams<T> {
	/**
	 * The type of binary messages. It can be `blob` (default) or `arraybuffer`.
	 */
	binaryType?: WebSocketBinaryType;

	/**
	 * The WebSocket server's URL. It should start with the ws:// or wss:// protocol.
	 */
	url: string | null | Signal<string | null> | (() => string | null);

	/**
	 * An optional error handler.
	 * @param error The error object.
	 */
	onError?(error: unknown): void;

	/**
	 * Handles received messages.
	 * @param message The WebSocket message from the server.
	 */
	onMessage(message: T): void;
}

/**
 * Creates and returns a WebSocket client. It can be used to send and receive messages.
 * When the current reactive context is destroyed, the client disconnects and can no longer be used.
 * @example
 * function MyWebSocketClient() {
 * 	const ws = webSocket({
 * 		url: "ws://my-domain:1234/my-path",
 * 		onMessage(message) {
 * 			console.log("Message from the server:", message);
 * 		}
 * 	});
 * 
 * 	timeout(() => ws.send("Current time: " + Date.now()), 1000);
 * 
 * 	return Div(() => ws.isOpen ? "Connected" : "Not connected");
 * }
 * @param params The WebSocket configuration. It must contain the URL and the message handler
 * but may also include `binaryType` and an error handler.
 * @returns The WebSocket client instance.
 */
export function webSocket<T extends WebSocketMessage>(params: WebSocketParams<T>): WebSocketClient<WebSocketMessage> {
	var win = getWindow();
	var isOpen = signal(false);
	var queue: WebSocketMessage[] = [];
	var webSocket: WebSocket | null = null;
	var currentURL: string | URL | null = null;
	var binaryType = params.binaryType || "blob";
	var url = params.url;
	var isDestroyed = false;

	effect(function(): void {
		currentURL = isSignal(url) || typeof url === "function" ? url() : url;

		if (currentURL !== null) {
			connect();
			onDestroy(destroy);
		}
	});

	function destroy(): void {
		if (!isDestroyed) {
			isDestroyed = true;
			close();
		}
	}

	function onError(error: unknown): void {
		close();

		if (params.onError) {
			params.onError(error);
		}
	}

	function onClose(): void {
		close();
		isOpen.set(false);
	}

	function onMessage(event: MessageEvent<T>): void {
		params.onMessage(event.data);
	}

	function onOpen(): void {
		isOpen.set(true);
		var n = queue.length;
		
		if (n) {
			var q = queue;
			queue = [];
			
			for (var i = 0; i < n; ++i) {
				send(q[i]);
			}
		}
	}

	function close(): void {
		var ws = webSocket;
	
		if (ws) {
			ws.onmessage = null;
			ws.onopen = null;
			ws.onclose = null;
			ws.onerror = null;
			ws.close();
			webSocket = null;
			isOpen.set(false);
		}
	}	

	function connect(): void {
		if (isDestroyed) {
			throw new Error("Cannot connect, WebSocket is destroyed");
		}

		if (!webSocket && currentURL !== null && win) {
			if (typeof win.WebSocket !== "function") {
				throw new ReferenceError("WebSocket is not supported");
			}
			
			var ws = new win.WebSocket(currentURL);
			ws.onopen = onOpen;
			ws.onmessage = onMessage;
			ws.onclose = onClose;
			ws.onerror = onError;
			ws.binaryType = binaryType;
			webSocket = ws;
		}
	}
	
	function send(message: WebSocketMessage): void {
		if (isDestroyed) {
			throw new Error("Cannot send messsage, WebSocket is destroyed");
		}

		if (isOpen.get() && webSocket && webSocket.readyState === 1) {
			webSocket.send(message);
		} else {
			queue.push(message);
			connect();
		}
	}

	return {
		isOpen: isOpen,
		connect: connect,
		send: send
	};
}
