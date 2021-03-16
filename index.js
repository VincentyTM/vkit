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
	exportFile: "index.html"
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
					res.setHeader('content-type', 'text/plain; charset=utf-8');
					res.write('START');
					requests.push(() => {
						res.end('REFRESH');
					});
					break;
				default:
					res.setHeader('content-type', 'text/html; charset=utf-8');
					res.end( getHtmlString(true) );
					break;
			}
		}).listen({port: config.port}, resolve).on("error", reject);
	});
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

async function getLibraries(bundle){
	const libraries = [];
	bundle = bundle
		.split("\r").join("")
		.split("\n").join("")
		.split("\t").join("")
		.split(" ").join("");
	if( bundle.includes("$(") || bundle.includes("$.") ){
		libraries.push(await getLibrary("core"));
		if( bundle.includes(".append(") ){
			libraries.push(await getLibrary("dom"));
		}
		if( bundle.includes("$.html") ){
			libraries.push(await getLibrary("html"));
		}
		if( bundle.includes("$.cookie") ){
			libraries.push(await getLibrary("cookie"));
		}
		if( bundle.includes(".drag") ){
			libraries.push(await getLibrary("drag"));
		}
		if(
			bundle.includes("$.prop") ||
			bundle.includes("$.text") ||
			bundle.includes("$.map") ||
			bundle.includes("$.is") ||
			bundle.includes("$.effect") ||
			bundle.includes("$.render")
		){
			libraries.push(await getLibrary("component"));
		}
		if( bundle.includes("$.serialize") ){
			libraries.push(await getLibrary("serialize"));
		}
		if( bundle.includes("$.inject") ){
			libraries.push(await getLibrary("inject"));
		}
		if( bundle.includes("$.thread") ){
			libraries.push(await getLibrary("thread"));
			if( bundle.includes("$.recorder") ){
				libraries.push(await getLibrary("recorder"));
			}
		}else if( bundle.includes("$.recorder") ){
			libraries.push(await getLibrary("thread"), await getLibrary("recorder"));
		}
		if( bundle.includes("$.webrtc") ){
			libraries.push(await getLibrary("webrtc"));
		}
		if( bundle.includes("$.lexer") ){
			libraries.push(await getLibrary("lexer"));
		}
		if( bundle.includes("$.parser") ){
			libraries.push(await getLibrary("parser"));
		}
		if( bundle.includes("$.parseTree") ){
			libraries.push(await getLibrary("parsetree"));
		}
		if( bundle.includes("$.windowForm") ){
			libraries.push(await getLibrary("windowForm"));
		}
		if( bundle.includes(".sandbox") ){
			libraries.push(await getLibrary("sandbox"));
		}
		if( bundle.includes(".select") || bundle.includes(".insertText") ){
			libraries.push(await getLibrary("selection"));
		}
	}
	return libraries;
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
	
	jsString = files
		.filter(file => file.startsWith("app/") && file.toLowerCase().endsWith(".js"))
		.sort(PathComparator).map(file => cache[file])
		.join("\n");
	
	jsString = (await getLibraries(jsString))
		.map(str => str
			.split("\r").join("\n")
			.split("\n\n").join("\n")
			.split("\n\n").join("\n")
			.split("\n\n").join("\n")
			.split("\t").join("")
			.split("\n").join("")
		).join("\n") + "\n\n" + jsString;
	
	cssString = files
		.filter(file => file.toLowerCase().endsWith(".css"))
		.sort(PathComparator)
		.map(file => cache[file])
		.join("\n")
		.split("\t").join("")
		.split("\r").join("")
		.split("\n").join("")
		.split("  ").join(" ");
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
		'<style>',
			cssString,
		'</style>',
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
