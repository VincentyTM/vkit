import computed, {ComputedSignal} from "./computed";
import isSignal from "./isSignal";
import onUnmount from "./onUnmount";
import readOnly from "./readOnly";
import signal, {Signal} from "./signal";
import update from "./update";

type HttpRequestHeaders = {
	[name: string]: string;
};

export type HttpRequest = string | null | {
	async?: boolean;
	body?: Document | XMLHttpRequestBodyInit | null | undefined;
	headers?: HttpRequestHeaders;
	method?: string;
	url: string | URL;
	user?: string | null | undefined;
	password?: string | null | undefined;
	responseType?: XMLHttpRequestResponseType;
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
 * @param request The HTTP request as a string URL or object. It can optionally be wrapped in a signal or a function.
 * @returns A computed signal containing the HTTP response object.
 */
export default function http<T = unknown>(request: HttpRequest | Signal<HttpRequest> | (() => HttpRequest)) {
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
			update();
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

				update();
			}
		};
		
		if (xhr.upload) {
			xhr.upload.onprogress = function(event: ProgressEvent<EventTarget>): void {
				uploadProgress.set(event);
				update();
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
			
			xhr.responseType = req.responseType || "";

			var headers = req.headers;
			
			if (headers) {
				for (var name in headers) {
					xhr.setRequestHeader(name, headers[name]);
				}
			}
			
			xhr.send(req.body);
		}

		onUnmount(function() {
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
