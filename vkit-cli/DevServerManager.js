import fs from "fs";
import {startBrowser} from "../server-libraries/index.js";
import {buildDevIndexHtml} from "./build.js";
import createDevServer from "./createDevServer.js";

const {promises: fsp} = fs;

export default class DevServerManager {
	server = null;
	
	constructor({
		config,
		fileCache,
		libraryContainer,
		output,
		reloader,
	}) {
		this.config = config;
		this.fileCache = fileCache;
		this.libraryContainer = libraryContainer;
		this.output = output;
		this.port = config.port;
		this.reloader = reloader;
	}
	
	async startDevServer() {
		const {
			config,
			fileCache,
			libraryContainer,
			output,
			reloader,
		} = this;
		
		let key = null;
		let cert = null;
		
		if (config.https) {
			output.pkcStartLoading();
			
			try {
				const [k, c] = await Promise.all([
					fsp.readFile(config.privateKeyFile),
					fsp.readFile(config.certificateFile)
				]);
				
				key = k;
				cert = c;
				output.pkcLoaded();
			} catch (ex) {
				output.pkcError(ex);
			}
		}
		
		const server = createDevServer({
			apiCommands: {
				reload(req, res){
					reloader.watch(res);
				}
			},
			cert,
			config,
			fileCache,
			https: config.https,
			indexContent: () => buildDevIndexHtml({
				config,
				fileCache,
				libraryContainer,
				output
			}),
			key,
			output,
		});
		
		this.server = server;
		this.port = await server.ready;
		this.output.serverStarted(this.port);
		return this.port;
	}
	
	async restartDevServer() {
		this.stopDevServer();
		await this.startDevServer();
	}
	
	stopDevServer() {
		if (this.server) {
			this.server.stop();
			this.server = null;
		}
		
		this.output.serverStopped();
	}
	
	startBrowser() {
		const {config} = this;
		
		startBrowser(
			(config.https ? "https" : "http") +
			"://localhost:" +
			this.port +
			config.indexPath
		);
	}
}
