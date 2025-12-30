interface ScriptParams {
	document: Document;
	crossOrigin?: string;
	integrity?: string;
	nonce?: string;
	referrerPolicy?: string;
	url: string;
	onError?(error: unknown): void;
	onLoad?(): void;
}

interface HTMLScriptElementExtension extends HTMLScriptElement {
	readonly readyState?: "complete" | "loaded";
	onreadystatechange?: (() => void) | null;
}

export function createScript(params: ScriptParams): void {
	var url = params.url;
	var d = params.document;
	var t = d.getElementsByTagName("script")[0];
	var s = d.createElement("script") as HTMLScriptElementExtension;

	function reset(): void {
		s.onload = s.onerror = s.onreadystatechange = null;

		var p = s.parentNode;

		if (p) {
			p.removeChild(s);
		}
	}

	function fail(error: unknown): void {
		reset();

		if (params.onError !== undefined) {
			params.onError(error);
		}
	}

	function done(): void {
		reset();

		if (params.onLoad !== undefined) {
			params.onLoad();
		}
	}

	function loadHandler(): void {
		var r = s.readyState;

		if (!r || r === "loaded" || r === "complete") {
			done();
		}
	}

	if (params.referrerPolicy) s.referrerPolicy = params.referrerPolicy;
	if (params.crossOrigin) s.crossOrigin = params.crossOrigin;
	if (params.integrity) s.integrity = params.integrity;
	if (params.nonce) s.nonce = params.nonce;

	s.onerror = fail;

	if (s.onload !== undefined) {
		s.onload = loadHandler;
	} else {
		s.onreadystatechange = loadHandler;
	}

	s.type = "text/javascript";
	s.async = true;
	s.src = url;

	if (t) {
		var parent = t.parentNode;
		if (parent) {
			parent.insertBefore(s, t);
		}
	} else {
		(d.head || d.getElementsByTagName("head")[0]).appendChild(s);
	}
}
