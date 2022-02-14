const mimeTypes = {
	"appcache": "text/cache-manifest",
	"txt": "text/plain; charset=UTF-8",
	"css": "text/css; charset=UTF-8",
	"csv": "text/csv; charset=UTF-8",
	"htm": "text/html; charset=UTF-8",
	"html": "text/html; charset=UTF-8",
	"js": "text/javascript; charset=UTF-8",
	"json": "application/json; charset=UTF-8",
	"jpg": "image/jpeg",
	"jpeg": "image/jpeg",
	"png": "image/png",
	"gif": "image/gif",
	"webp": "image/webp",
	"svg": "image/svg+xml",
	"svgz": "image/svg+xml",
	"bmp": "image/bmp",
	"mp3": "audio/mpeg",
	"wav": "audio/wav",
	"flac": "audio/flac",
	"ogg": "audio/ogg",
	"m4a": "audio/m4a",
	"mid": "audio/midi",
	"midi": "audio/midi",
	"mp4": "video/mp4",
	"webm": "video/webm",
	"avi": "video/x-msvideo",
	"pdf": "application/pdf",
	"sdf": "package/sdf",
	"php": "application/x-httpd-php",
	"bin": "application/octet-stream",
	"zip": "application/zip",
	"rar": "application/vnd.rar",
	"7z": "application/x-7z-compressed",
	"ico": "image/x-icon"
};

function getMimeType(path, defaultMimeType = "application/octet-stream"){
	const ldot=path.lastIndexOf(".");
	if(~ldot){
		const ext = path.substring(ldot+1).toLowerCase();
		return mimeTypes[ext] || defaultMimeType;
	}
	return defaultMimeType;
}

module.exports = getMimeType;
