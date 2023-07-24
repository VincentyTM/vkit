const DEFAULT_MIME_TYPE = "application/octet-stream";

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

function getMimeType(path, defaultMimeType = DEFAULT_MIME_TYPE){
	const ldot = path.lastIndexOf(".");
	if(~ldot){
		const ext = path.substring(ldot + 1).toLowerCase();
		return MIME_TYPES[ext] || defaultMimeType;
	}
	return defaultMimeType;
}

module.exports = getMimeType;
