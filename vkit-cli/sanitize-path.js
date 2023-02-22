function sanitizePath(path, strict = false){
	const qmp = path.indexOf("?");
	if(~qmp){
		path = path.substring(0, qmp);
	}
	path = path.split("/");
	for(let i=path.length; i--;){
		path[i] = path[i].substring(0,50);
		if( strict ){
			path[i] = path[i].replace(/[^a-zA-Z0-9_\-.]/g, "");
		}
		while( path[i].charAt(0)=="." ){
			path[i] = path[i].substring(1);
		}
		if(!path[i]){
			path.splice(i, 1);
		}
	}
	path = path.join("/");
	return path;
}

module.exports = sanitizePath;
