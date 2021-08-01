const PathComparator = (x,y) => y.split("/").length - x.split("/").length || x.localeCompare(y);

const DEBUG_SCRIPT = `<script type="text/javascript" language="javascript">
"use strict";
window.onerror = function(err){
	var msg = document.createElement("h1");
	msg.style.color = "red";
	msg.style.padding = "0.2em 1em";
	msg.appendChild( document.createTextNode(err) );
	console.error(err);
	document.body.appendChild(msg);
};
</script>`;

const RELOAD_SCRIPT = `<script type="text/javascript" language="javascript">
"use strict";
(function(){
	function sendRequest(){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if( xhr.readyState==4 || xhr.readyState==0 ){
				xhr.onreadystatechange = null;
				xhr.status==200 ? location.reload(true) : sendRequest();
			}
		};
		xhr.open("GET", "/reload", true);
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
	async compile(transformSrc, allowDebugScripts = true){
		const cachedItem = this.cache.get(this.fileName);
		if(!cachedItem){
			return '';
		}
		const style = this.getStyles(transformSrc);
		const body = this.getBodyContents(transformSrc, allowDebugScripts);
		return cachedItem
			.replace("{{style}}", style)
			.replace("{{body}}", body);
	}
	getBodyContents(transformSrc, allowDebugScripts){
		return (allowDebugScripts ? this.getDebugScripts() + '\n' : '') + this.getScripts(transformSrc);
	}
	getDebugScripts(){
		return DEBUG_SCRIPT + '\n' + RELOAD_SCRIPT;
	}
	getStyles(transformSrc){
		const cache = this.cache.cache;
		const styles = Object.keys(cache).filter(src => src.toLowerCase().endsWith(".css")).sort(PathComparator);
		if( transformSrc ){
			return styles.map(src => '<link rel="stylesheet" href="' + transformSrc(src) + '">').join('\n');
		}else{
			return '<style>\n' + styles.map(src => this.transformStyle(cache[src])).join('\n') + '\n</style>';
		}
	}
	getScripts(transformSrc){
		const cache = this.cache.cache;
		const scripts = Object.keys(cache).filter(src => src.toLowerCase().endsWith(".js")).sort(PathComparator);
		if( transformSrc ){
			return '<script type="text/javascript" language="javascript">\n"use strict";\n' +
				this.getLibraries(scripts.map(src => cache[src]).join('\n')) +
			'\n</script>\n' +
			scripts.map(src => '<script type="text/javascript" language="javascript" src="' + transformSrc(src) + '"></script>').join('\n');
		}else{
			const compiledScript = scripts.map(src => this.transformScript(cache[src])).join('\n');
			return '<script type="text/javascript" language="javascript">\n"use strict";\n' +
				this.getLibraries(compiledScript) + '\n' +
				compiledScript +
			'\n</script>';
		}
	}
	getLibraries(input){
		try{
			return this.libraryContainer.getLibraries(input).map(lib => this.transformLibrary(lib.source)).join("\n");
		}catch(ex){
			console.error(ex);
			return "";
		}
	}
	transformLibrary(script){
		return script
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
