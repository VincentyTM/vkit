const fs = require("fs");
const http = require("http");
const https = require("https");

const loadCertificate = (privateKey, certificate) => (
	new Promise((resolve, reject) => {
		let key, cert;
		const success = () => key && cert && resolve({
			key,
			cert
		});
		fs.readFile(privateKey, (err, k) => {
			if( err ){
				console.error("Private key not found");
			}else{
				success(key = k);
			}
		});
		fs.readFile(certificate, (err, c) => {
			if( err ){
				console.error("Certificate not found");
			}else{
				success(cert = c);
			}
		});
	})
);

class Server {
	constructor(requestListener){
		this.port = -1;
		this.server = null;
		this.requestListener = requestListener;
	}
	async start(options){
		return new Promise(async (resolve, reject) => {
			const {port, secure, privateKey, certificate} = options;
			this.stop();
			this.server = secure
				? https.createServer(
					await loadCertificate(privateKey, certificate),
					this.requestListener
				)
				: http.createServer(this.requestListener);
			this.port = port;
			this.server.listen({port}, resolve).on("error", err => {
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
