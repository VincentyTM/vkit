/* Requirements */

const fs = require("fs");
const process = require("process");
const path = require("path");
const Server = require("./server.js");
const Commands = require("./commands.js");
const Config = require("./config.js");
const Reloader = require("./reloader.js");
const FileCache = require("./file-cache.js");
const LibraryContainer = require("./library-container.js");
const HTMLCompiler = require("./html-compiler.js");
const recursivelyIterate = require("./recursively-iterate.js");
const sanitizePath = require("./sanitize-path.js");
const serveFile = require("./serve-file.js");
const getMimeType = require("./get-mime-type.js");
const DEFAULT_INDEX_HTML = require("./index-html.js");
const DEFAULT_APP_JS = require("./app-js.js");
const STYLESHEET_REGEXP = /\.css$/i;

/* Instances */

let librariesLoaded = false;
const srcDirectory = process.argv.slice(2).join(" ").trim() || ".";
const configFile = srcDirectory + "/config.json";
const reloader = new Reloader();
const server = new Server(requestListener);
const transformSRC = src => config.debugPath + "/" + src.replace(config.srcDirectory + "/src/", "");
const getExportPath = () => path.isAbsolute(config.exportFile) ? config.exportFile : config.srcDirectory + "/" + config.exportFile;
const cache = new FileCache(
	(updated, deleted) => {
		const srcs = Object.keys(updated);
		commands.reload(
			Object.keys(deleted).length === 0 && srcs.every(src => STYLESHEET_REGEXP.test(src)) && !config.isRelease()
				? srcs.map(transformSRC)
				: null
		);
		if( config.autoExport && librariesLoaded ){
			commands.exportApplication(getExportPath(), config.includeLibraries);
		}
	}
);
const config = new Config(srcDirectory, configFile, async needsRestart => {
	if( needsRestart ){
		await commands.startServer(config.port);
		await commands.build();
		commands.startBrowser(config.port);
	}else{
		await commands.build();
		commands.reload();
	}
});
const libraryContainer = new LibraryContainer(__dirname + "/../vkit"); libraryContainer.loadAll().then(() => {
	console.log("Loaded all libraries.");
	librariesLoaded = true;
});
const htmlCompiler = new HTMLCompiler(cache, srcDirectory + "/src/index.html", libraryContainer);
const commands = new Commands(server, reloader, cache, config, htmlCompiler);
const withoutQuery = url => {
	const pos = url.indexOf("?");
	return ~pos ? url.substring(0, pos) : url;
};

/* Request listener */

async function requestListener(req, res){
	const path = withoutQuery(req.url);
	if( path === "/reload" ){
		reloader.subscribe(res);
		return;
	}
	if( path === "/" ){
		res.setHeader('content-type', 'text/html; charset=utf-8');
		res.end(await htmlCompiler.compile(
			config.isRelease() ? null : src => transformSRC(src) + cache.getVersionString(src),
			true
		));
		return;
	}
	if( path.startsWith("/" + config.debugPath + "/") ){
		const cachedPath = decodeURIComponent(path.replace("/" + config.debugPath + "/", config.srcDirectory + "/src/"));
		const cached = cache.get(cachedPath);
		if( cached ){
			res.setHeader('content-type', getMimeType(sanitizePath(path), "text/html; charset=UTF-8"));
			res.setHeader('content-length', Buffer.byteLength(cached));
			res.end(cached);
			return;
		}
	}
	serveFile(req, res, config.srcDirectory + "/www/" + sanitizePath(path));
}

/* Main menu */

console.log("");
console.log("+-------------------+");
console.log("| vKit CLI started! |");
console.log("+-------------------+");

process.openStdin().on("data", function(data){
	const cmd = data
		.toString()
		.replace(/\r|\n/g, "")
		.split(" ");
	
	switch( cmd[0] ){
		case "help":
			console.log("");
			console.log("+---------------+");
			console.log("| vKit CLI help |");
			console.log("+---------------+");
			console.log("  help: Show this information");
			console.log("  exit: Exit");
			console.log("  build: Clear cache and rebuild application");
			console.log("  export: Export application to a standalone HTML file");
			console.log("  reload: Reload browser tab(s)");
			console.log("  config: Reload config file");
			console.log("  start: Start application in browser");
			break;
		case "exit": process.exit(); break;
		case "start": commands.startBrowser(config.port); break;
		case "reload": commands.reload(); break;
		case "config": commands.loadConfig(); break;
		case "build": commands.rebuild(); break;
		case "export": commands.exportApplication(getExportPath(), config.includeLibraries); break;
		default: console.log("Unknown command. Try 'help'.");
	}
});

async function init(){
	try{
		try{ await new Promise((resolve, reject) => fs.mkdir(srcDirectory, err => err ? reject(err) : resolve())); }catch(ex){}
		try{ await new Promise((resolve, reject) => fs.mkdir(srcDirectory + "/www", err => err ? reject(err) : resolve())); }catch(ex){}
		try{
			await new Promise((resolve, reject) => fs.mkdir(srcDirectory + "/src", err => err ? reject(err) : resolve()));
			await new Promise((resolve, reject) => fs.writeFile(srcDirectory + "/src/App.js", DEFAULT_APP_JS, {flag: "wx"}, err => err ? reject(err) : resolve()));
		}catch(ex){}
		try{ await new Promise((resolve, reject) => fs.writeFile(srcDirectory + "/src/index.html", DEFAULT_INDEX_HTML, {flag: "wx"}, err => err ? reject(err) : resolve())); }catch(ex){}
		try{
			await config.load();
		}catch(ex){
			await config.save();
		}
		config.watch();
		cache.watchDirectory(config.srcDirectory + "/src");
		cache.updateDirectory(config.srcDirectory + "/src");
		await commands.startServer(config.port);
		await commands.build();
		commands.startBrowser(config.port);
	}catch(ex){
		console.error("Error:", ex);
	}
}

init();
