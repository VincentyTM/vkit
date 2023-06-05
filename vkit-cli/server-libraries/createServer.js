const http = require("http");
const https = require("https");

function createServer(requestListener, errorHandler, portChangeHandler){
	let server = null;
	let serverPort = 80;
	
	function start({
		httpsOptions = null,
		port = serverPort
	} = {}){
		if( server ){
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
	
	function stop(){
		if( server ){
			server.close();
			server = null;
		}
		
		return this;
	}
	
	return {
		get port(){
			return serverPort;
		},
		start,
		stop
	};
}

module.exports = createServer;
