const PathComparator = (x,y) => y.split("/").length - x.split("/").length || x.localeCompare(y);

const DEBUG_SCRIPT = `<script type="text/javascript" language="javascript">
"use strict";
window.onerror = function(message, source, lineno, colno, error){
	function elem(tagName, children, style){
		var el = document.createElement(tagName);
		var n = children.length;
		for(var i=0; i<n; ++i){
			var child = children[i];
			if( child ){
				el.appendChild(child.nodeType ? child : document.createTextNode(child));
			}
		}
		if( style ){
			for(var k in style){
				el.style[k] = style[k];
			}
		}
		return el;
	}
	function getDigitCount(number){
		var count = 1;
		while( number >= 10 ){
			number = number / 10 | 0;
			++count;
		}
		return count;
	}
	function padLeft(number, length, padding){
		number = String(number);
		while( number.length < length ){
			number = padding + number;
		}
		return number;
	}
	function filterRegExp(array, regexp){
		var newArray = [];
		var n = array.length;
		for(var i=0; i<n; ++i){
			if( regexp.test(array[i]) ){
				newArray.push(array[i]);
			}
		}
		return newArray;
	}
	function FormattedCode(functionName, source, lineno, colno, lineColor, blockColor){
		function getCodeElem(code){
			var lines = code.split("\\r").join("").split("\\t").join("    ").split("\\n").slice(Math.max(0, lineno - 4), lineno + 3);
			var n = lines.length;
			var lineOfError = lineno < 4 ? lineno - 1 : 3;
			var maxDigits = getDigitCount(lineno - lineOfError + n - 1);
			for(var i=0; i<n; ++i){
				var lineText = (i === lineOfError ? " > " : "   ") + padLeft(lineno - lineOfError + i, maxDigits, " ") + " | " + lines[i];
				lines[i] = elem("div", [lineText], i === lineOfError ? {backgroundColor: lineColor} : null);
			}
			return elem("pre", [
				elem("code", lines)
			], {
				backgroundColor: blockColor,
				overflow: "auto"
			});
		}
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if( xhr.readyState === 4 && xhr.status === 200 ){
				if( placeholder.parentNode ){
					placeholder.parentNode.replaceChild(getCodeElem(xhr.responseText), placeholder);
				}
			}
		};
		xhr.open("GET", source, true);
		xhr.send();
		var sourceLink = elem("a", [source], {
			color: "#0076ec",
			textDecoration: "underline"
		});
		sourceLink.href = source;
		sourceLink.target = "_blank";
		var placeholder = document.createTextNode("");
		var msg = elem("div", [
			elem("h2", [functionName], {
				marginTop: "1.25em",
				marginBottom: "-0.5em",
				fontWeight: "normal",
				fontSize: "120%"
			}),
			elem("p", ["at ", sourceLink, ":", lineno], {
				marginLeft: "1em"
			}),
			placeholder
		]);
		return msg;
	}
	function StackLine(line, lineColor, blockColor){
		var regexp = /^(\\s*at\\s+)?([^\\s@]*)\\s*@?\\s*\\(?\\s*([^)]+)\\)?$/g;
		var match = regexp.exec(line);
		if(!match){
			return null;
		}
		var functionName = match[2];
		var sourceWithNumbers = match[3];
		var lastColonPos = sourceWithNumbers.lastIndexOf(":");
		var secondLastColonPos = sourceWithNumbers.lastIndexOf(":", lastColonPos - 1);
		var ln = parseInt(sourceWithNumbers.substring(secondLastColonPos + 1, lastColonPos));
		var cn = parseInt(sourceWithNumbers.substring(lastColonPos + 1));
		var src = sourceWithNumbers.substring(0, secondLastColonPos).replace(/\\[[^\\]]+\\]\\s*\\(?/g, "");
		if( ln > 0 && cn > 0 ){
			return FormattedCode(functionName, src, ln, cn, lineColor, blockColor);
		}else{
			return null;
		}
	}
	function StackHiddenContents(stack){
		var n = stack.length;
		var views = new Array(n - 1);
		for(var i=1; i<n; ++i){
			views[i] = StackLine(stack[i], "#fcf2af", "#fffbe7");
		}
		return elem("div", views);
	}
	var stack = error && error.stack ? filterRegExp(error.stack.split("\\n"), /^(\\s*at\\s+)?([^\\s@]*)\\s*@?\\s*\\(?\\s*([^)]+)\\)?$/) : [];
	if( stack[0] && !stack[0].startsWith(" ") && stack[0].indexOf("@") === -1 ){
		stack.shift();
	}
	var closeButton = elem("button", ["x"], {
		float: "right",
		border: "0",
		padding: "0 0.5em",
		margin: "0",
		background: "none",
		color: "#999999",
		font: "inherit",
		fontSize: "200%",
		cursor: "pointer"
	});
	closeButton.onclick = function(){
		if( container.parentNode ){
			container.parentNode.removeChild(container);
		}
	};
	var container = elem("div", [
		closeButton,
		elem("h1", [message], {
			color: "#cc0000",
			fontSize: "180%",
			marginTop: "0.25em"
		}),
		stack.length > 0 ? StackLine(stack[0], "#ffcccc", "#ffeeee") : FormattedCode("", source, lineno, colno, "#ffcccc", "#ffeeee"),
		stack.length > 1 ? elem("details", [
			elem("summary", ["Stack trace"], {
				cursor: "pointer"
			}),
			StackHiddenContents(stack)
		]) : null
	], {
		fontFamily: "Helvetica, Arial, sans-serif",
		padding: "0.2em 0.2em 1em 1em",
		backgroundColor: "#f5f5f5",
		color: "#333333"
	});
	document.body.appendChild(container);
};
</script>`;

const RELOAD_SCRIPT = `<script type="text/javascript" language="javascript">
"use strict";
(function(){
	function applyStyle(src){
		var stylesheets = document.styleSheets;
		for(var i=stylesheets.length; i--;){
			var href = stylesheets[i].href;
			if(!href){
				continue;
			}
			var pos = href.indexOf("?");
			if(~pos){
				href = href.substring(0, pos);
			}
			href = href.replace(location.href, "");
			if( href.charAt(0) !== "/" ){
				href = "/" + href;
			}
			if( href === src ){
				stylesheets[i].ownerNode.href = src + "?v=" + new Date().getTime();
				return true;
			}
		}
		return false;
	}
	
	var unloaded = false;
	
	function onUnload(){
		unloaded = true;
	}
	
	if( window.addEventListener ){
		window.addEventListener("beforeunload", onUnload);
	}else if( window.attachEvent ){
		window.attachEvent("onbeforeunload", onUnload);
	}
	
	function sendRequest(){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if( xhr.readyState === 4 || xhr.readyState === 0 ){
				xhr.onreadystatechange = null;
				if( unloaded ){
					return;
				}
				if( xhr.status !== 200 ){
					sendRequest();
					return;
				}
				var res = xhr.responseText.split(":");
				var n = res.length;
				var onlyStyles = true;
				for(var i=1; i<n; ++i){
					if(!applyStyle(res[i])){
						onlyStyles = false;
					}
				}
				if( onlyStyles ){
					sendRequest();
					return;
				}
				if( location.pathname === "{{appPath}}" ){
					location.reload();
				}else{
					location.replace("{{appPath}}" + location.hash);
				}
			}
		};
		xhr.open("POST", "{{reloadPath}}", true);
		xhr.send();
	}
	setTimeout(sendRequest, 0);
})();
</script>`;

class HTMLCompiler {
	constructor(cache, fileName, libraryContainer){
		this.cache = cache;
		this.fileName = fileName;
		this.libraryContainer = libraryContainer;
	}
	static stringEncode(str){
		return str
			.replace(/\\/g, "\\\\")
			.replace(/"/g, "\\\"")
			.replace(/\f/g, "\\f")
			.replace(/\n/g, "\\n")
			.replace(/\r/g, "\\r")
			.replace(/\t/g, "\\t")
			.replace(/\v/g, "\\v");
	}
	async compile(
		transformSrc,
		allowDebugScripts = true,
		includeLibraries = true,
		appPath = "/",
		reloadPath = "/reload"
	){
		const cachedItem = this.cache.get(this.fileName);
		if(!cachedItem){
			return '';
		}
		this.checkFiles();
		const style = this.getStyles(transformSrc);
		const body = this.getBodyContents(
			transformSrc,
			allowDebugScripts,
			includeLibraries,
			appPath,
			reloadPath
		);
		return cachedItem
			.replace("{{style}}", style)
			.replace("{{body}}", body);
	}
	checkFiles(){
		const cache = this.cache;
		for(const src of this.getExportableJSFiles()){
			if( /<\/script>/i.test(cache.get(src)) ){
				console.warn("Warning: </script> found in '" + src + "'");
			}
		}
		for(const src of this.getCSSFiles()){
			if( /<\/style>/i.test(cache.get(src)) ){
				console.warn("Warning: </style> found in '" + src + "'");
			}
		}
	}
	getCSSFiles(){
		return this.cache.getKeys().filter(src =>
			src.toLowerCase().endsWith(".css")
		).sort(PathComparator);
	}
	getExportableJSFiles(){
		return this.cache.getKeys().filter(src => {
			src = src.toLowerCase();
			return src.endsWith(".js") && !src.endsWith(".test.js");
		}).sort(PathComparator);
	}
	getScriptsAsModule(includeLibraries, moduleFile, moduleSymbol){
		const module = this.cache.get(moduleFile);
		if( module ){
			return module.replace(
				moduleSymbol,
				this.getScriptsRaw(includeLibraries, file => file !== moduleFile)
			);
		}else{
			return this.getScriptsRaw(includeLibraries);
		}
	}
	getScriptsRaw(includeLibraries = true, filter){
		const cache = this.cache;
		let scripts = this.getExportableJSFiles();
		if( filter ){
			scripts = scripts.filter(filter);
		}
		if(!includeLibraries){
			scripts = scripts.filter(src => !src.toLowerCase().endsWith(".lib.js"));
		}
		const dataFiles = this.getDataFiles();
		const compiledScript = scripts.map(src => this.transformScript(cache.get(src))).join('\n');
		return (includeLibraries ? this.getLibraries(compiledScript) + '\n' : '') +
			(dataFiles.length > 0 ? dataFiles.join('\n') + '\n' : '') +
			compiledScript;
	}
	getBodyContents(transformSrc, allowDebugScripts, includeLibraries, appPath, reloadPath){
		return (allowDebugScripts ? this.getDebugScripts(appPath, reloadPath) + '\n' : '') +
			this.getScripts(transformSrc, includeLibraries);
	}
	getDebugScripts(appPath, reloadPath){
		return DEBUG_SCRIPT + '\n' + RELOAD_SCRIPT.replace(/\{\{appPath\}\}/g, appPath).replace(/\{\{reloadPath\}\}/g, reloadPath);
	}
	getDataFiles(){
		const cache = this.cache;
		const data = [];
		for(const src of cache.getKeys()){
			const lowerSrc = src.toLowerCase();
			if( lowerSrc.endsWith(".txt") ){
				data.push(
					'$.data["' +
						HTMLCompiler.stringEncode(
							src.replace(/\\/g, "/").replace("./src/", "")
						) + '"] = "' +
						HTMLCompiler.stringEncode(cache.get(src))
							.replace(/<\/script>/gi, '</scr"+"ipt>') +
					'";'
				);
			}else if( lowerSrc.endsWith(".json") ){
				try{
					const json = cache.get(src);
					JSON.parse(json);
					data.push(
						'$.data["' +
							HTMLCompiler.stringEncode(
								src.replace(/\\/g, "/").replace("./src/", "")
							) + '"] = ' +
							json.replace(/<\/script>/gi, '</scr"+"ipt>') +
						';'
					);
				}catch(ex){
					console.error("Invalid JSON in '" + src + "'");
				}
			}
		}
		return data;
	}
	getStyles(transformSrc){
		const cache = this.cache;
		const styles = cache.getKeys().filter(src => src.toLowerCase().endsWith(".css")).sort(PathComparator);
		if( transformSrc ){
			return styles.map(src => '<link rel="stylesheet" href="' + transformSrc(src) + '">').join('\n');
		}else{
			const styleContent = styles.map(src => this.transformStyle(cache.get(src))).join('\n');
			return styleContent ? '<style>\n' + styleContent + '\n</style>' : '';
		}
	}
	getScripts(transformSrc, includeLibraries){
		const cache = this.cache;
		if( transformSrc ){
			const scripts = cache.getKeys().filter(src => src.toLowerCase().endsWith(".js")).sort(PathComparator);
			const dataFiles = this.getDataFiles();
			return '<script type="text/javascript" language="javascript">\n"use strict";\n' +
				this.getLibraries(scripts.map(src => cache.get(src)).join('\n')) +
				(dataFiles.length > 0 ? '\n' + dataFiles.join('\n') : '') +
			'\n</script>\n' +
			scripts.map(src => '<script type="text/javascript" language="javascript" src="' + transformSrc(src) + '"></script>').join('\n');
		}else{
			return '<script type="text/javascript" language="javascript">\n"use strict";\n' +
				this.getScriptsRaw(includeLibraries) +
			'\n</script>';
		}
	}
	getLibraries(input){
		try{
			const libraries = this.libraryContainer.getLibraries(input);
			return libraries.map(lib => this.transformLibrary(lib.source)).join("\n");
		}catch(ex){
			console.error(ex);
			return "";
		}
	}
	transformLibrary(script){
		return script
			.replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, "")
			.split("\r").join("\n")
			.split("\n\n").join("\n")
			.split("\n\n").join("\n")
			.split("\n\n").join("\n")
			.split("\t").join("")
			.split("\n").join("");
	}
	transformStyle(style){
		return style
			.split("\t").join("")
			.split("\r").join("")
			.split("\n").join("")
			.split("  ").join(" ");
	}
	transformScript(script){
		return script;
	}
}

const escapeHTMLMap={
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#039;'
};
const escapeHTMLReplacer = m => escapeHTMLMap[m];
const escapeHTML = html => String(html).replace(/[&<>"']/g, escapeHTMLReplacer);

module.exports = HTMLCompiler;
