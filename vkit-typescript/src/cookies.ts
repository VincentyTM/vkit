import { getWindow } from "./getWindow.js";
import { inject } from "./inject.js";
import { RenderConfig, RenderConfigService } from "./RenderConfigService.js";

interface Cookies {
	readonly document: Document | null;
	readonly renderConfig: RenderConfig;
	deleteCookie(name: string, options?: SetCookieOptions): void;
	forEach(callback: (name: string, value: string) => void): void;
	getCookie(name: string): string | null;
	setCookie(name: string, value: string, expiry?: Date | number | string | null, options?: SetCookieOptions): void;
}

interface SetCookieOptions {
	httpOnly?: boolean;
	path?: string;
	sameSite?: "Lax" | "None" | "Strict";
	secure?: boolean;
}

var leadingAndTrailingWhitespaces = /(^\s+)|(\s+$)/g;

export function cookies(): Cookies {
	var win = getWindow();
	
	return {
		document: win ? win.document : null,
		renderConfig: inject(RenderConfigService),
		deleteCookie: deleteCookie,
		forEach: forEach,
		getCookie: getCookie,
		setCookie: setCookie
	};
}

function deleteCookie(this: Cookies, name: string, options?: SetCookieOptions): void {
	this.setCookie(name, "", 0, options);
}

function forEach(this: Cookies, callback: (name: string, value: string) => void): void {
	var doc = this.document;
	var cookieString = doc ? doc.cookie : this.renderConfig.request ? this.renderConfig.request.headers.cookie : undefined;

	if (cookieString === undefined) {
		return;
	}

	var cookieStrings = typeof cookieString === "string" ? [cookieString] : cookieString;
	var m = cookieStrings.length;

	for (var j = 0; j < m; ++j) {
		var rc = cookieStrings[j];
		var cookies = rc.split(";");
		var n = cookies.length;
		
		for (var i = 0; i < n; ++i) {
			var cookie = cookies[i].replace(leadingAndTrailingWhitespaces, "").split("=");
			callback(decodeURIComponent(cookie[0]), decodeURIComponent(cookie[1]));
		}
	}
}

function getCookie(this: Cookies, name: string): string | null {
	var doc = this.document;

	if (doc) {
		var cookies = ";" + doc.cookie.replace(/\s/g, "");
		var search = ";" + encodeURIComponent(name) + "=";
		var offset = cookies.indexOf(search);
		
		if (offset === -1) {
			return null;
		}
		
		offset += search.length;
		var end = cookies.indexOf(";", offset);
		
		if (end === -1) {
			end = cookies.length;
		}
		
		return decodeURIComponent(cookies.substring(offset, end));
	}

	var request = this.renderConfig.request;

	if (!request) {
		return null;
	}

	var cookieHeadersRaw = request.headers.cookie;
		
	if (!cookieHeadersRaw) {
		return null;
	}

	var cookieHeaders = typeof cookieHeadersRaw === "string" ? [cookieHeadersRaw] : cookieHeadersRaw;
	var m = cookieHeaders.length;

	for (var j = 0; j < m; ++j) {	
		var rcParts = cookieHeaders[j].split(";");
		var n = rcParts.length;
		
		for (var i = 0; i < n; ++i) {
			var token = rcParts[i];
			var cookie = token.replace(leadingAndTrailingWhitespaces, "").split("=");
			
			if (cookie[0] === name) {
				return decodeURIComponent(cookie[1]);
			}
		}
	}
	
	return null;
}

function setCookie(
	this: Cookies,
	name: string,
	value: string,
	expiry?: Date | number | string | null,
	options?: SetCookieOptions
): void {
	var suffix: string[] = [];
	
	if (expiry !== undefined && expiry !== null) {
		suffix.push("; Expires=", new Date(expiry).toUTCString());
	}
	
	if (options && options.secure) {
		suffix.push("; Secure");
	}
	
	if (options && options.httpOnly) {
		suffix.push("; HttpOnly");
	}
	
	suffix.push(
		"; SameSite=", options && options.sameSite || "Strict",
		"; Path=", options && options.path || "/"
	);
	
	var doc = this.document;

	if (doc) {
		var cookie = [
			encodeURIComponent(name),
			"=",
			encodeURIComponent(value)
		];
		doc.cookie = cookie.concat(suffix).join("");
	} else {
		this.renderConfig.cookies[name] = {
			value: value,
			suffix: suffix.join("")
		};
		
		setResponseHeader(this.renderConfig);
	}
}

function setResponseHeader(renderConfig: RenderConfig): void {
	var renderConfigCookies = renderConfig.cookies;
	var collection: string[] = [];
	
	for (var name in renderConfigCookies) {
		var cookie = renderConfigCookies[name];
		var cookieString = [
			encodeURIComponent(name),
			"=",
			encodeURIComponent(cookie.value),
			cookie.suffix
		].join("");
		collection.push(cookieString);
	}
	
	var response = renderConfig.response;

	if (response) {
		response.setHeader("set-cookie", collection);
	}
}
