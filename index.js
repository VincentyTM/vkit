const fs = require("fs");
const http = require("http");
const process = require("process");
const childProcess = require("child_process");

const requests = [];
const configFile = "config.json";
const config = {
	port: 8000,
	lang: "en",
	themeColor: "",
	title: "vKit Application",
	appDirectory: "app",
	exportFile: "index.html",
	environment: "dev"
};
let latestPort = null;
let latestAppDirectory = null;

const PathComparator = (x,y) => y.split("/").length - x.split("/").length || x.localeCompare(y);
const EscapeHTMLMap={
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;'
};
const EscapeHTMLReplacer = m => EscapeHTMLMap[m];
const EscapeHTML = html => String(html).replace(/[&<>"']/g, EscapeHTMLReplacer);

const cache = {};
let jsString = '';
let cssString = '';
let taskCount = 0;
let server = null;

async function startServer(){
	return new Promise((resolve, reject) => {
		if( server )
			server.close();
		server = http.createServer(function(req, res){
			switch( req.url ){
				case "/refresh":
					res.setHeader("content-type", "text/plain; charset=utf-8");
					res.write("START");
					requests.push(() => {
						res.end("REFRESH");
					});
					break;
				case "/":
					res.setHeader("content-type", "text/html; charset=utf-8");
					res.end( getHtmlString(true) );
					break;
				default:
					serveFile(req, res, sanitizePath(req.url));
			}
		}).listen({port: config.port}, resolve).on("error", reject);
	});
}

function serveFile(req, res, path){
	const headers = {};
	fs.lstat(path, function(err, stats){
		if( err || !stats ){
			res.writeHead(404, {
				"content-type": "text/plain",
				"content-length": 3
			});
			res.end("404");
			return;
		}
		if(!stats.isFile()){
			res.writeHead(403, {
				"content-type": "text/plain",
				"content-length": 3
			});
			res.end("404");
			return;
		}
		if(!recent(stats.mtimeMs, headers, req)){
			res.writeHead(304, {
				"content-length": 0
			});
			res.end();
			return;
		}
		headers["content-type"]=getMimeType(path);
		headers["accept-ranges"]="bytes";
		const size=stats.size;
		const start=0;
		const end=size;
		const range=req.headers.range;
		if( range ){
			const parts=range.replace("bytes=", "").split("-");
			start=parseInt(parts[0]);
			end=parts[1] ? parseInt(parts[1]) : size-1;
			if( start>=size || start>end || start<0 || isNaN(start) || end>size ){
				res.writeHead(416, {
					"content-type": "text/plain",
					"content-length": 3
				});
				res.end("416");
				return;
			}
			headers["content-range"]="bytes "+start+"-"+end+"/"+size;
			headers["content-length"]=end-start+1;
			res.writeHead(206, headers);
		}else{
			headers["content-length"]=size;
			res.writeHead(200, headers);
		}
		if( req.method.toLowerCase()==="head" ){
			res.end();
			return;
		}
		const stream=fs.createReadStream(path, {
			"start": start,
			"end": end
		});
		stream.on("error", function(){ res.end(); });
		stream.on("finish", function(){ res.end(); });
		stream.on("open", function(){ stream.pipe(res); });
	});
}

function recent(lastModified, headers, req){
	headers["vary"] = "if-modified-since";
	headers["cache-control"] = "public, max-age=60, no-transform, immutable, min-fresh: 60, stale-while-revalidate=30, stale-if-error=30";
	headers["expires"] = new Date(Date.now() + 300000).toUTCString();
	headers["last-modified"] = new Date(lastModified).toUTCString();
	return !( "if-modified-since" in req.headers && new Date(req.headers["if-modified-since"]).getTime() >= lastModified );
}

function sanitizePath(path, strict){
	path=decodeURIComponent(path);
	path=path.split("/");
	for(let i=path.length; i--;){
		path[i]=path[i].substring(0,50);
		if( strict ){
			path[i]=path[i].replace(/[^a-zA-Z0-9_\-.]/g, "");
		}
		while( path[i].charAt(0)=="." ){
			path[i]=path[i].substring(1);
		}
		if(!path[i]){
			path.splice(i, 1);
		}
	}
	path=path.join("/");
	return path;
}

function getMimeType(path){
	const ldot=path.lastIndexOf(".");
	if(~ldot){
		const ext=path.substring(ldot+1).toLowerCase();
		switch( ext ){
			case "appcache": return "text/cache-manifest";
			case "txt": return "text/plain; charset=UTF-8";
			case "css": return "text/css; charset=UTF-8";
			case "html": case "htm": return "text/html; charset=UTF-8";
			case "js": return "text/javascript; charset=UTF-8";
			case "json": return "application/json; charset=UTF-8";
			case "jpg": case "jpeg": return "image/jpeg";
			case "png": case "gif": case "webp": return "image/"+ext;
			case "mp3": case "wav": case "flac": case "ogg": return "audio/"+ext;
			case "mp4": case "avi": case "webm": return "video/"+ext;
			case "ico": return "image/x-icon";
		}
	}
	return "application/octet-stream";
}

async function recursivelyIterate(dir, array){
	return await new Promise((resolve, reject) => {
		fs.readdir(dir, function(err, files){
			if( err )
				return reject("Can't access directory '" + dir + "': " + err);
			
			let count = files.length;
			if( count==0 ){
				return resolve(array);
			}
			for(const file of files){
				const path = dir + "/" + file;
				fs.stat(path, async function(err, stat){
					if( err )
						return reject("Error while reading '" + path + "': " + err);
					
					if( stat.isDirectory() ){
						await recursivelyIterate(path, array);
					}else{
						array.push(path);
					}
					
					--count==0 && resolve(array);
				});
			}
		});
	});
}

async function readFile(filename){
	return await new Promise((resolve, reject) => {
		fs.readFile(filename, "utf8", (err, data) => {
			if( err )
				return reject(err);
			
			resolve(data);
		});
	});
}

async function loadConfig(){
	try{
		const json = JSON.parse( await readFile(configFile) );
		config.port = json.port ? Math.min(65535, Math.max(0, json.port|0)) : 8000;
		config.lang = String(json.lang || "en");
		config.themeColor = String(json.themeColor || "");
		config.title = String(json.title || "");
		config.appDirectory = String(json.appDirectory || "app");
		config.exportFile = String(json.exportFile || "index.html");
		config.environment = String(json.environment).toLowerCase()==="dev" ? "dev" : "release";
	}catch(ex){
	}
	if( latestPort!==config.port || latestAppDirectory!==config.appDirectory ){
		latestPort = config.port;
		latestAppDirectory = config.appDirectory;
		await startServer();
		console.log("Server is running on port " + config.port + ". Type 'help' for help.");
		await build();
		startBrowser("http://localhost:" + config.port);
	}else{
		await build();
		refresh();
	}
}

async function updateCache(filename){
	if(!(filename.toLowerCase().endsWith(".js") || filename.toLowerCase().endsWith(".css")))
		return;
	++taskCount;
	try{
		const content = await readFile(filename);
		if( content===cache[filename] ){
			console.log("Skipping", filename);
		}else{
			console.log("Compiling", filename);
			cache[filename] = content;
		}
	}catch(ex){
		switch(ex.code){
			case "EISDIR":
				break;
			case "ENOENT":
				delete cache[filename];
				console.log("Deleting", filename);
				break;
			default: console.error("Can't read", filename, "as", ex);
		}
	}
	if( --taskCount==0 ){
		await compileBundle();
		console.log("Done!");
		refresh();
	}
}

function exportApplication(){
	fs.writeFile(
		config.exportFile,
		getHtmlString(false),
		err => err
			? console.error("Error while exporting file to '", config.exportFile, "': ", err)
			: console.log("Exported to file '", config.exportFile, "'.")
	);
}

async function getLibrary(name){
	const filename = "src/" + name + ".js";
	if( filename in cache )
		return cache[filename];
	
	return cache[filename] = await readFile(filename);
}

function getLibraryNames(bundle){
	const libraries = [];
	bundle = bundle
		.split("\r").join("")
		.split("\n").join("")
		.split("\t").join("")
		.split(" ").join("");
	if( bundle.includes("$(") || bundle.includes("$.") ){
		libraries.push("core");
		if( bundle.includes(".append(") ){
			libraries.push("dom");
		}
		if( bundle.includes("$.html") ){
			libraries.push("html");
		}
		if( bundle.includes("$.cookie") ){
			libraries.push("cookie");
		}
		if( bundle.includes(".drag") ){
			libraries.push("drag");
		}
		if(
			bundle.includes("$.prop") ||
			bundle.includes("$.text") ||
			bundle.includes("$.map") ||
			bundle.includes("$.is") ||
			bundle.includes("$.effect") ||
			bundle.includes("$.render")
		){
			libraries.push("component");
		}
		if( bundle.includes("$.serialize") ){
			libraries.push("serialize");
		}
		if( bundle.includes("$.inject") ){
			libraries.push("inject");
		}
		if( bundle.includes("$.thread") ){
			libraries.push("thread");
			if( bundle.includes("$.recorder") ){
				libraries.push("recorder");
			}
		}else if( bundle.includes("$.recorder") ){
			libraries.push("thread", "recorder");
		}
		if( bundle.includes("$.webrtc") ){
			libraries.push("webrtc");
		}
		if( bundle.includes("$.lexer") ){
			libraries.push("lexer");
		}
		if( bundle.includes("$.parser") ){
			libraries.push("parser");
		}
		if( bundle.includes("$.parseTree") ){
			libraries.push("parsetree");
		}
		if( bundle.includes("$.windowForm") ){
			libraries.push("windowForm");
		}
		if( bundle.includes(".sandbox") ){
			libraries.push("sandbox");
		}
		if( bundle.includes(".select") || bundle.includes(".insertText") ){
			libraries.push("selection");
		}
	}
	return libraries;
}

async function getLibrarySource(libraries){
	const n = libraries.length;
	const result = new Array(n);
	for(let i=0; i<n; ++i)
		result[i] = await getLibrary(libraries[i]);
	return result;
}

async function build(){
	try{
		const files = await recursivelyIterate(config.appDirectory, []);
		for(const file of files){
			if( file in cache )
				continue;
			
			await updateCache(file);
		}
	}catch(ex){
		console.error(ex);
	}
}

async function rebuild(){
	for(const key in cache)
		delete cache[key];
	await build();
}

async function compileBundle(){
	const files = Object.keys(cache);
	
	const appJSFiles = files.filter(file => file.startsWith(config.appDirectory + "/") && file.toLowerCase().endsWith(".js")).sort(PathComparator);
	const appCSSFiles = files.filter(file => file.toLowerCase().endsWith(".css")).sort(PathComparator);
	
	const appSource = appJSFiles.map(file => cache[file]).join("\n");
	
	const libraries = getLibraryNames(appSource);
	
	if( config.environment==="dev" ){
		jsString = '\n' + libraries.map(lib => "src/" + lib + ".js").concat(appJSFiles).map(src => '<script src="' + src + '"></script>\n').join('');
		cssString = '\n' + appCSSFiles.map(src => '<link rel="stylesheet" href="' + src + '">\n').join('');
	}else{
		const librarySource = (await getLibrarySource(libraries))
			.map(str => str
				.split("\r").join("\n")
				.split("\n\n").join("\n")
				.split("\n\n").join("\n")
				.split("\n\n").join("\n")
				.split("\t").join("")
				.split("\n").join("")
			).join("\n") + "\n\n";
		
		jsString = [
			'<script>\n"use strict";\n\n/** vKit **/\n',
				librarySource,
				appSource,
			'\n</script>'
		].join('');
	
		cssString = [
			'<style>',
				appCSSFiles
					.map(file => cache[file])
					.join("\n")
					.split("\t").join("")
					.split("\r").join("")
					.split("\n").join("")
					.split("  ").join(" "),
			'</style>'
		].join('');
	}
}

function refresh(){
	for(const func of requests.splice(0, requests.length))
		func();
}

function startBrowser(url){
	var start = (process.platform == 'darwin' ? 'open': process.platform == 'win32' ? 'start': 'xdg-open');
	childProcess.exec(start + ' ' + url);
}

function getHtmlString(doIncludeRefresh){
	return [
		'<!DOCTYPE html><html lang="',
			EscapeHTML(config.lang),
		'">',
		'<meta charset="UTF-8">',
		'<meta name="viewport" content="viewport-fit=cover, minimal-ui, width=device-width, initial-scale=1, user-scalable=yes">',
		'<meta name="apple-mobile-web-app-capable" content="yes">',
		'<meta name="theme-color" content="',
			EscapeHTML(config.themeColor),
		'">',
		'<title>',
			EscapeHTML(config.title),
		'</title>',
		cssString,
		'</head><body>',
		doIncludeRefresh ? ['<script>(function(){',
			'function sendRequest(){',
				'var xhr = new XMLHttpRequest();',
				'xhr.onreadystatechange = function(){',
					'if( xhr.readyState==4 || xhr.readyState==0 ){',
						'xhr.onreadystatechange = null;',
						'xhr.status==200 ? location.reload(true) : sendRequest();',
					'}',
				'};',
				'xhr.open("GET", "/refresh", true);',
				'xhr.send();',
			'}',
			'setTimeout(sendRequest, 0);',
		'})();</script>'].join('') : '',
		'<script>\n"use strict";\n\n/** vKit **/\n',
			jsString,
		'\n</script></body></html>'
	].join('');
}



console.log("");
console.log("+----------------------------+");
console.log("| vKit Builder Tool started! |");
console.log("+----------------------------+");

process.openStdin().on("data", function(data){
	const cmd = data
		.toString()
		.replace(/\r|\n/g, "")
		.split(" ");
	
	switch( cmd[0] ){
		case "help":
			console.log("");
			console.log("+------------------------+");
			console.log("| vKit Builder Tool Help |");
			console.log("+------------------------+");
			console.log("  help: Show this information");
			console.log("  exit: Exit");
			console.log("  build: Clear cache and rebuild application");
			console.log("  export: Export application to a standalone HTML file");
			console.log("  refresh: Reload browser tab(s)");
			console.log("  reload: Reload config file");
			console.log("  start: Start application in browser");
			break;
		case "exit":
			process.exit();
			break;
		case "start":
			startBrowser("http://localhost:" + config.port);
			break;
		case "reload":
			loadConfig();
			break;
		case "refresh":
			refresh();
			break;
		case "build":
			rebuild();
			break;
		case "export":
			exportApplication();
			break;
		default:
			console.log("Unknown command. Try 'help'.");
	}
});

try{
	fs.watch(config.appDirectory, {recursive: true}, (eventType, filename) => updateCache(config.appDirectory + "/" + filename));
}catch(ex){
	console.error("The '" + config.appDirectory + "' directory doesn't exist.");
}

try{
	fs.watch(configFile, loadConfig);
}catch(ex){}

loadConfig();
