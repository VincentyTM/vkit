import { computed, ComputedSignal, Signal } from "./computed.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";
import { readOnly } from "./readOnly.js";
import { signal } from "./signal.js";

type HttpRequestHeaders = {
	[name: string]: string;
};

export type HttpRequest = string | null | {
	async?: boolean;
	body?: Document | XMLHttpRequestBodyInit | null | undefined;
	headers?: HttpRequestHeaders;
	method?: string;
	mimeType?: string;
	url: string | URL;
	user?: string | null | undefined;
	password?: string | null | undefined;
	responseType?: XMLHttpRequestResponseType;
	withCredentials?: boolean;
};

export type HttpResponse<T> = {
	readonly ok: false;
	readonly progress: null;
	readonly unsent: true;
	readonly uploadProgress: null;
} | {
	readonly ok: false;
	readonly progress: ComputedSignal<HttpProgress>;
	readonly unsent: false;
	readonly uploadProgress: ComputedSignal<HttpProgress>;
} | {
	readonly body: T;
	readonly ok: boolean;
	readonly progress: null;
	readonly status: number;
	readonly unsent: false;
	readonly uploadProgress: null;
	getAllResponseHeaders(): string;
	getResponseHeader(name: string): string | null;
};

export type HttpProgress = {
	readonly lengthComputable: boolean;
	readonly loaded: number;
	readonly total: number;
};

var UNSENT: HttpResponse<never> = {
	ok: false,
	progress: null,
	unsent: true,
	uploadProgress: null
};

var INIITIAL_PROGRESS: HttpProgress = {
	loaded: 0,
	total: 0,
	lengthComputable: false
};

/**
 * Sends an HTTP request initially and when its input changes.
 * When the current reactive context is destroyed, the HTTP is request is aborted.
 * This method can only be used in a reactive context.
 * @example
 * function HttpExample() {
 * 	const response = http({
 * 		url: "/api/",
 * 		method: "POST",
 * 		headers: {
 * 			"content-type": "application/json",
 * 			"x-requested-with": "XMLHttpRequest"
 * 		},
 * 		body: JSON.stringify({
 * 			someExampleData: 42
 * 		}),
 * 		responseType: "json"
 * 	});
 * 	
 * 	return response.view((res) => {
 * 		if (res.unsent) {
 * 			return "The request is null!";
 * 		}
 * 		
 * 		if (res.progress) {
 * 			return res.progress.map((progress) => (
 * 				`Loading: ${progress.loaded} / ${progress.total}`
 * 			));
 * 		}
 * 		
 * 		if (!res.ok) {
 * 			return `Request failed! Status: ${res.status}`;
 * 		}
 * 		
 * 		return `Successful! Response: ${JSON.stringify(res.body)}`;
 * 	});
 * }
 * @param request The HTTP request as a string URL or object. It can optionally be wrapped in a signal or a function.
 * @returns A computed signal containing the HTTP response object.
 */
export function http<T = unknown>(request: HttpRequest | Signal<HttpRequest> | (() => HttpRequest)) {
	var response = signal<HttpResponse<T>>(UNSENT);

	function setRequest(req: HttpRequest): void {
		if (req === null) {
			response.set(UNSENT);
			return;
		}

		var progress = signal(INIITIAL_PROGRESS);
		var uploadProgress = signal(INIITIAL_PROGRESS);

		response.set({
			ok: false,
			progress: readOnly(progress),
			unsent: false,
			uploadProgress: readOnly(uploadProgress)
		});
		
		var xhr = new XMLHttpRequest();

		xhr.onprogress = function(event: ProgressEvent<EventTarget>): void {
			progress.set(event);
		};

		xhr.onreadystatechange = function(): void {
			if (xhr.readyState === 4 || xhr.readyState === 0) {
				var status = xhr.status;

				response.set({
					body: xhr.response !== undefined ? xhr.response : xhr.responseText,
					ok: status >= 200 && status <= 299,
					progress: null,
					status: status,
					unsent: false,
					uploadProgress: null,

					getAllResponseHeaders: function(): string {
						return xhr.getAllResponseHeaders();
					},

					getResponseHeader: function(name: string): string | null {
						return xhr.getResponseHeader(name);
					}
				});
			}
		};
		
		if (xhr.upload) {
			xhr.upload.onprogress = function(event: ProgressEvent<EventTarget>): void {
				uploadProgress.set(event);
			};
		}

		if (typeof req === "string") {
			xhr.open("GET", req, true);
			xhr.send();
		} else {
			xhr.open(
				(req.method || "GET").toUpperCase(),
				req.url || "",
				req.async !== false,
				req.user,
				req.password
			);
			
			if (req.mimeType !== undefined && xhr.overrideMimeType) {
				xhr.overrideMimeType(req.mimeType);
			}

			xhr.responseType = req.responseType || "";

			if (req.withCredentials !== undefined) {
				xhr.withCredentials = req.withCredentials;
			}

			var headers = req.headers;
			
			if (headers) {
				for (var name in headers) {
					xhr.setRequestHeader(name, headers[name]);
				}
			}
			
			xhr.send(req.body);
		}

		onDestroy(function() {
			xhr.onprogress = null;
			xhr.onreadystatechange = null;
			
			if (xhr.upload) {
				xhr.upload.onprogress = null;
			}
			
			xhr.abort();
		});
	}

	if (typeof request === "function") {
		(isSignal(request) ? request : computed(request)).effect(setRequest);
	} else {
		setRequest(request);
	}
	
	return readOnly(response);
}
