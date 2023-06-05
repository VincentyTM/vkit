module.exports = (path, strict = false) => (
	path.split("/").filter(Boolean).map(part => {
		part = part.substring(0, 50);
		
		if( strict ){
			part = part.replace(/[^a-zA-Z0-9_\-.]/g, "");
		}
		
		while( part.charAt(0) === "." ){
			part = part.substring(1);
		}
		
		return part;
	}).join("/")
);
