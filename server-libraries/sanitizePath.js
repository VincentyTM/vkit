const MAX_SEGMENT_LENGTH = 50;

module.exports = (path, strict = false) => (
	path.split("/").map((part) => {
		part = part.substring(0, MAX_SEGMENT_LENGTH);
		
		if( strict ){
			part = part.replace(/[^a-zA-Z0-9_\-.]/g, "");
		}
		
		return part.replace(/^\.+/g, "");
	}).filter(Boolean).join("/")
);
