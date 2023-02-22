const http = require("http");

class Server {
	constructor(requestListener){
		this.port = -1;
		this.server = null;
		this.requestListener = requestListener;
	}
		return new Promise((resolve, reject) => {
	async start({port}){
			this.stop();
			this.server = http.createServer(this.requestListener).listen({port}, resolve).on("error", err => {
			this.port = port;
				if( err.code === "EADDRINUSE" ){
					console.log("\nPort " + port + " is already in use. You can change it in config.json.");
					this.start({
						...options,
						port: (port + 1) % 65536
					}).then(resolve, reject);
					return;
				}else{
					reject(err);
				}
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
