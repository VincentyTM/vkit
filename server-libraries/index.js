import childProcess from "child_process";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";

const {promises: fsp} = fs;

const DEFAULT_MIME_TYPE = "application/octet-stream";
const MAX_SEGMENT_LENGTH = 50;
const X_REQUESTED_WITH = "XMLHttpRequest";

const MIME_TYPES = {
	"3g2": "video/3gpp2",
	"3gp": "video/3gpp",
	"3gpp": "video/3gpp",
	"3gpp2": "video/3gpp2",
	"7z": "application/x-7z-compressed",
	"appcache": "text/cache-manifest",
	"avi": "video/x-msvideo",
	"bin": "application/octet-stream",
	"bmp": "image/bmp",
	"css": "text/css; charset=UTF-8",
	"csv": "text/csv; charset=UTF-8",
	"flac": "audio/flac",
	"flv": "video/x-flv",
	"gif": "image/gif",
	"htm": "text/html; charset=UTF-8",
	"html": "text/html; charset=UTF-8",
	"ico": "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "text/javascript; charset=UTF-8",
	"json": "application/json; charset=UTF-8",
	"m3u8": "application/x-mpegURL",
	"mov": "video/quicktime",
	"mp4": "video/mp4",
	"mp3": "audio/mpeg",
	"png": "image/png",
	"ogg": "audio/ogg",
	"m4a": "audio/m4a",
	"mid": "audio/midi",
	"midi": "audio/midi",
	"pdf": "application/pdf",
	"php": "application/x-httpd-php",
	"rar": "application/vnd.rar",
	"svg": "image/svg+xml",
	"svgz": "image/svg+xml",
	"ts": "video/MP2T",
	"txt": "text/plain; charset=UTF-8",
	"wav": "audio/wav",
	"webm": "video/webm",
	"webp": "image/webp",
	"wmv": "video/x-ms-wmv",
	"zip": "application/zip"
};

export const cache = (req, res, lastModified = 0, cacheDuration = 0) => {
	if (cacheDuration <= 0) {
		noCache(res);
		return false;
	}
	
	res.setHeader("cache-control", "public, max-age=" + cacheDuration + ", stale-while-revalidate=60480000, stale-if-error=60480000");
	res.setHeader("expires", new Date(new Date().getTime() + cacheDuration * 1000).toUTCString());
	res.setHeader("last-modified", new Date(lastModified).toUTCString());
	const ifModifiedSince = req.headers["if-modified-since"];
	
	if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastModified) {
		res.writeHead(304, {}).end();
		return true;
	}
	
	return false;
};

export const copyDirectory = async (src, dest) => {
	await fsp.mkdir(dest, {recursive: false});
	const entries = await fsp.readdir(src, {withFileTypes: true});
	
	await Promise.all(
		entries.map(entry => (
			(entry.isDirectory() ? copyDirectory : fsp.copyFile)(
				path.join(src, entry.name),
				path.join(dest, entry.name)
			)
		))
	);
};

export const createHttpError = (status, message = null) => {
	if (!(status >= 400 && status <= 599)) {
		throw new Error("Invalid status code " + status);
	}
	
	const error = new Error(message ? message : "Http error " + status);
	error.status = status;
	return error;
};

export const createServer = (requestListener, errorHandler, portChangeHandler) => {
	let server = null;
	let serverPort = 80;
	
	const start = ({
		httpsOptions = null,
		port = serverPort
	} = {}) => {
		if (server) {
			stop();
		}
		
		server = httpsOptions
			? https.createServer(httpsOptions, requestListener)
			: http.createServer(requestListener);
		
		port = Math.min(65535, Math.max(0, port | 0));
		serverPort = port;
		server.listen({port}, () => portChangeHandler(port)).on("error", errorHandler);
		return this;
	}
	
	const stop = () => {
		if (server) {
			server.close();
			server = null;
		}
		
		return this;
	};
	
	return {
		get port() {
			return serverPort;
		},
		start,
		stop
	};
};

export const file = async (
	req,
	res,
	path,
	status = 200,
	cacheDuration = 0
) => await new Promise((resolve, reject) => {
	fs.lstat(path, (err, stats) => {
		if (err || !stats || !stats.isFile()) {
			reject(createHttpError(404, "File not found"));
			return;
		}
		
		if (cache(req, res, stats.mtimeMs, cacheDuration)) {
			return;
		}
		
		res.setHeader("accept-ranges", "bytes");
		
		if (!res.getHeader("content-type")) {
			res.setHeader("content-type", getMimeType(path));
		}
		
		const range = req.headers.range;
		const size = stats.size;
		let start = 0;
		let end = size;
		
		if (range) {
			const parts = range.replace("bytes=", "").split("-");
			start = parseInt(parts[0]);
			end = parts[1] ? parseInt(parts[1]) : size - 1;
			
			if (start >= size || start > end || start < 0 || isNaN(start) || end > size) {
				reject(createHttpError(416, "Range not satisfiable"));
				return;
			}
			
			res.setHeader("content-range", "bytes " + start + "-" + end + "/" + size);
			res.setHeader("content-length", end - start + 1);
			res.writeHead(206, {});
		} else {
			res.setHeader("content-length", size);
			res.writeHead(status, {});
		}
		
		if (req.method.toLowerCase() === "head") {
			res.end();
			resolve();
			return;
		}
		
		const stream = fs.createReadStream(path, {
			"start": start,
			"end": end
		});
		
		stream.on("error", (err) => {
			res.end();
			reject(err);
		});
		
		stream.on("finish", () => {
			res.end();
			resolve();
		});
		
		stream.on("open", () => {
			stream.pipe(res);
		});
	});
});

export const getMimeType = (path, defaultMimeType = DEFAULT_MIME_TYPE) => {
	const ldot = path.lastIndexOf(".");
	
	if (~ldot) {
		const ext = path.substring(ldot + 1).toLowerCase();
		return MIME_TYPES[ext] || defaultMimeType;
	}
	
	return defaultMimeType;
};

export const getPath = (req) => {
	const pos = req.url.indexOf("?");
	return pos === -1 ? req.url : req.url.substring(0, pos);
};

export const getSearch = (req) => {
	const pos = req.url.indexOf("?");
	return pos === -1 ? "" : req.url.substring(pos);
};

export const noCache = (res) => {
	res.setHeader("cache-control", "no-cache, no-store, no-transform, must-revalidate, proxy-revalidate, max-age=0");
	res.setHeader("pragma", "no-cache");
};

export const readDirectory = async (dir, handleItem, {signal} = {}) => {
	return await new Promise((resolve, reject) => (
		fs.readdir(dir, async (err, files) => {
			if (err) {
				reject(err);
				return;
			}
			
			if (signal && signal.aborted) {
				reject(signal.reason);
				return;
			}
			
			await Promise.all(
				files.map(async (file) => {
					const path = dir + "/" + file;
					
					try {
						await readDirectory(path, handleItem, {signal});
					} catch (ex) {
						if (ex.code === "ENOTDIR") {
							if (signal && signal.aborted) {
								reject(signal.reason);
							} else {
								await handleItem(path);
							}
						} else {
							reject(ex);
						}
					}
				})
			);
			
			resolve();
		})
	));
};

export const redirect = (res, url) => {
	res.writeHead(302, {"location": url}).end();
};

export const sanitizePath = (path, strict = false) => (
	path.split("/").map((part) => {
		part = part.substring(0, MAX_SEGMENT_LENGTH);
		
		if (strict) {
			part = part.replace(/[^a-zA-Z0-9_\-.]/g, "");
		}
		
		return part.replace(/^\.+/g, "");
	}).filter(Boolean).join("/")
);

export const selectRoute = async (
	req,
	res,
	routes,
	errorRoutes,
	staticRoot
) => {
	try {
		const method = req.method.toLowerCase();
		
		if (method !== "get" && method !== "head" && method !== "options" && req.headers["x-requested-with"] !== X_REQUESTED_WITH) {
			throw createHttpError(400, "Request blocked to avoid CSRF");
		}
		
		const path = getPath(req);
		const segments = path.split("/");
		const majorRoute = routes[segments[1] || ""];
		
		if (majorRoute) {
			const minorRoute = majorRoute[method + "_" + (segments[2] || "")];
			
			if (minorRoute) {
				await minorRoute(req, res, segments.slice(3));
			} else if (majorRoute[method]) {
				if (segments.length <= 2) {
					redirect(res, path + "/" + getSearch(req));
				} else {
					await majorRoute[method](req, res, segments.slice(2));
				}
			}
		} else {
			await file(req, res, staticRoot + sanitizePath(path));
		}
	} catch (error) {
		if (!error.status) {
			throw error;
		}
		
		const route = errorRoutes[error.status] || errorRoutes["500"];
		await route(req, res);
	}
};

export const startBrowser = (url) => {
	const start = (process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open");
	childProcess.exec(start + " " + url);
};

export const watchDirectory = (directory, callback, handleError) => {
	let watch = null;
	
	try {
		watch = fs.watch(directory, {recursive: true}, async (eventType, filename) => {
			try {
				await callback(directory + "/" + filename.split("\\").join("/"), eventType);
			} catch (ex) {
				handleError(ex);
			}
		}).on("error", handleError);
	} catch (ex) {
		handleError(ex);
	}
	
	return {
		close() {
			if (watch) {
				watch.close();
				watch = null;
			}
		}
	};
};
