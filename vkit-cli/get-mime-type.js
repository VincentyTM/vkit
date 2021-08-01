function getMimeType(path, defaultMimeType = "application/octet-stream"){
	const ldot=path.lastIndexOf(".");
	if(~ldot){
		const ext=path.substring(ldot+1).toLowerCase();
		switch( ext ){
			case "appcache": return "text/cache-manifest";
			case "txt": return "text/plain; charset=UTF-8";
			case "css": return "text/css; charset=UTF-8";
			case "html": case "htm": return "text/html; charset=UTF-8";
			case "js": return "text/javascript; charset=UTF-8";
			case "json": return "application/json; charset=UTF-8";
			case "jpg": case "jpeg": return "image/jpeg";
			case "png": case "gif": case "webp": return "image/"+ext;
			case "mp3": case "wav": case "flac": case "ogg": return "audio/"+ext;
			case "mp4": case "avi": case "webm": return "video/"+ext;
			case "ico": return "image/x-icon";
		}
	}
	return defaultMimeType;
}

module.exports = getMimeType;
