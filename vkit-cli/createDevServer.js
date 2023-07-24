const {cache, createServer, file, getMimeType, noCache} = require("../server-libraries");
const sanitizePath = require("./sanitizePath");

const text = (res, status, text) => {
	res.writeHead(status, {
		"content-type": "text/plain; charset=utf-8",
		"content-length": Buffer.byteLength(text)
	}).end(text);
};

module.exports = ({
	apiCommands = {},
	cert,
	config: {
		apiPath,
		indexPath,
		port,
		srcDir,
		srcPath,
		wwwDir,
		wwwPath
	},
	fileCache,
	https,
	indexContent,
	key,
	output
}) => {
	const requestListener = async (req, res) => {
		try{
			const url = req.url;
			const pos = url.indexOf("?");
			const path = pos === -1 ? url : url.substring(0, pos);
			const search = pos === -1 ? "" : url.substring(pos);
			
			if( path === indexPath ){
				const string = await indexContent();
				noCache(res);
				res.setHeader("content-type", "text/html; charset=utf-8");
				res.setHeader("content-length", Buffer.byteLength(string));
				res.end(string);
				return;
			}
			
			if( path.startsWith(apiPath) ){
				const command = await apiCommands[path.substring(apiPath.length)];
				if(!command){
					throw {status: 404};
				}
				command(req, res);
				return;
			}
			
			if( path.startsWith(srcPath) ){
				const filePath = path.replace(srcPath, srcDir + "/");
				const string = fileCache.get(filePath);
				
				if( string === null ){
					throw {status: 404};
				}
				
				if( cache(req, res, fileCache.getVersion(filePath), 1800000) ){
					return;
				}
				
				const mimeType = getMimeType(path);
				res.setHeader("content-type", mimeType);
				res.setHeader("content-length", Buffer.byteLength(string));
				res.end(string);
				return;
			}
			
			if( path.startsWith(wwwPath) ){
				await file(req, res, wwwDir + "/" + sanitizePath(path.replace(wwwPath, "")));
				return;
			}
			
			throw {status: 404};
		}catch(ex){
			switch(ex.status){
				case 404:
					text(res, 404, "404 Not Found");
					break;
				case 416:
					text(res, 416, "416 Range Not Satisfiable");
					break;
				default:
					output.httpError(ex);
			}
		}
	};
	
	const errorHandler = (err) => {
		if( err.code === "EADDRINUSE" ){
			output.portInUse(server.port);
			server.start({
				port: (server.port + 1) % 65536 | 0
			});
		}else{
			output.devServerError(err);
		}
	};
	
	let server;
	
	const ready = new Promise(resolve => {
		server = createServer(requestListener, errorHandler, resolve);
	});
	
	server.start({
		cert,
		httpsOptions: https ? {cert, key} : null,
		key,
		port
	});
	
	server.ready = ready;
	
	return server;
};
