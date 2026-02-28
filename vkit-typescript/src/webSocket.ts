import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

export type WebSocketMessage = string | ArrayBufferLike | Blob | ArrayBufferView;

export interface WebSocketClient {
	/**
	 * A read-only signal indicating whether the WebSocket client
	 * is successfully connected to the server.
	 */
	readonly isOpen: Signal<boolean>;

	/**
	 * Opens a connection to the WebSocket server.
	 * This method can be invoked by user events to reactivate the connection.
	 * Subsequent calls will have no additional effect.
	 * 
	 * This method cannot be called after the WebSocket client has been destroyed.
	 */
	connect(): void;

	/**
	 * Sends a message to the WebSocket server.
	 * If the connection is closed, the message will be queued until
	 * reconnection is successful.
	 * 
	 * This method cannot be called after the WebSocket client has been destroyed.
	 */
	send(message: WebSocketMessage): void;
}

interface WebSocketParamsBase {
	/**
	 * Specifies the type of binary messages: `blob` (default) or `arraybuffer`.
	 */
	binaryType?: "arraybuffer" | "blob";

	/**
	 * The URL of the WebSocket server, which should begin with `ws://` or `wss://`.
	 */
	url: string | null | Signal<string | null> | (() => string | null);

	/**
	 * An optional error handler.
	 * @param error The error object encountered during WebSocket operations.
	 */
	onError?(error: unknown): void;

	/**
	 * Callback for handling messages received from the server.
	 * @param message The WebSocket message received.
	 */
	onMessage(message: string | ArrayBuffer | Blob): void;
}

interface ArrayBufferWebSocketParams extends WebSocketParamsBase {
	binaryType: "arraybuffer";
	onMessage(message: string | ArrayBuffer): void;
}

interface BlobWebSocketParams extends WebSocketParamsBase {
	binaryType?: "blob";
	onMessage(message: string | Blob): void;
}

type WebSocketParams =
	| ArrayBufferWebSocketParams
	| BlobWebSocketParams
;

/**
 * Creates and returns a WebSocket client for sending and receiving messages.
 * The client will automatically disconnect when the current reactive context is destroyed.
 * 
 * @example
 * function MyWebSocketClient() {
 * 	const ws = webSocket({
 * 		url: "ws://my-domain:1234/my-path",
 * 		onMessage(message) {
 * 			console.log("Message from the server:", message);
 * 		}
 * 	});
 * 
 * 	return Div(
 * 		P(() => ws.isOpen() ? "Connected" : "Not connected"),
 * 
 * 		Button("Send current time", {
 * 			onclick: () => ws.send("Current time: " + Date.now())
 * 		})
 * 	);
 * }
 * @param params The configuration object for the WebSocket.
 * It must include the URL and the message handler, but may also specify
 * `binaryType` and an optional error handler.
 * @returns The instance of the WebSocket client.
 */
export function webSocket(params: WebSocketParams): WebSocketClient {
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

	function onMessage(event: MessageEvent): void {
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
			throw new Error("Cannot send message, WebSocket is destroyed");
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
