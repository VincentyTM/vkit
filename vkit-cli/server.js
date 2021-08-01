const http = require("http");

class Server {
	constructor(requestListener){
		this.server = null;
		this.requestListener = requestListener;
	}
	async start(port){
		return new Promise((resolve, reject) => {
			this.stop();
			this.server = http.createServer(this.requestListener).listen({port}, resolve).on("error", err => {
				if( err.code === "EADDRINUSE" ){
					console.error("\nPort", port, "is already in use.\n  Change it in config.json or stop the currently running server and restart the CLI.");
					return;
				}
				reject(err);
			});
		});
	}
	stop(){
		if( this.server ){
			this.server.close();
			this.server = null;
		}
	}
}

module.exports = Server;
