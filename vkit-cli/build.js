import comparePaths from "./comparePaths.js";

import {
	escapeScript,
	escapeString,
	escapeStyle,
} from "./escape.js";

import {
	isCSS,
	isJS,
	isJSON,
	isReleaseJS,
	isTemplateJS,
	isTestJS,
	isTXT,
} from "./is.js";

import {
	minifyCSS,
	minifyLibrary,
} from "./minify.js";

export const buildDevDebugScriptElement = () => `<script type="text/javascript" language="javascript">
"use strict";

window.onerror = function(message, source, lineno, colno, error) {
	function elem(tagName, children, style) {
		var el = document.createElement(tagName);
		var n = children.length;
		
		for (var i = 0; i < n; ++i) {
			var child = children[i];
			if (child) {
				el.appendChild(child.nodeType ? child : document.createTextNode(child));
			}
		}
		
		if (style) {
			for (var k in style) {
				el.style[k] = style[k];
			}
		}
		
		return el;
	}
	
	function getDigitCount(number) {
		var count = 1;
		
		while (number >= 10) {
			number = number / 10 | 0;
			++count;
		}
		
		return count;
	}
	
	function padLeft(number, length, padding) {
		number = String(number);
		
		while (number.length < length) {
			number = padding + number;
		}
		
		return number;
	}
	
	function filterRegExp(array, regexp) {
		var newArray = [];
		var n = array.length;
		
		for (var i = 0; i < n; ++i) {
			if (regexp.test(array[i])) {
				newArray.push(array[i]);
			}
		}
		
		return newArray;
	}
	
	function FormattedCode(functionName, source, lineno, colno, lineColor, blockColor) {
		function getCodeElem(code) {
			var lines = code.split("\\r").join("").split("\\t").join("    ").split("\\n").slice(Math.max(0, lineno - 4), lineno + 3);
			var n = lines.length;
			var lineOfError = lineno < 4 ? lineno - 1 : 3;
			var maxDigits = getDigitCount(lineno - lineOfError + n - 1);
			
			for (var i = 0; i < n; ++i) {
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
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4 && xhr.status === 200) {
				if (placeholder.parentNode) {
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
	
	function StackLine(line, lineColor, blockColor) {
		line = line.replace("new ", "");
		var regexp = /^(\\s*at\\s+)?([^\\s@]*)\\s*@?\\s*\\(?\\s*([^)]+)\\)?$/g;
		var match = regexp.exec(line);
		
		if (!match) {
			return null;
		}
		
		var functionName = match[2];
		var sourceWithNumbers = match[3];
		
		if (/^[0-9]+$/.test(sourceWithNumbers)) {
			sourceWithNumbers = functionName;
			functionName = "(anonymous)";
		}
		
		var lastColonPos = sourceWithNumbers.lastIndexOf(":");
		var secondLastColonPos = sourceWithNumbers.lastIndexOf(":", lastColonPos - 1);
		var ln = parseInt(sourceWithNumbers.substring(secondLastColonPos + 1, lastColonPos));
		var cn = parseInt(sourceWithNumbers.substring(lastColonPos + 1));
		var src = sourceWithNumbers.substring(0, secondLastColonPos).replace(/\\[[^\\]]+\\]\\s*\\(?/g, "");
		
		if (src === location.href) {
			return null;
		}
		
		if (ln > 0 && cn > 0) {
			return FormattedCode(functionName, src, ln, cn, lineColor, blockColor);
		} else {
			return null;
		}
	}
	
	function StackHiddenContents(stack) {
		var n = stack.length;
		var views = new Array(n - 1);
		
		for (var i = 1; i < n; ++i) {
			views[i] = StackLine(stack[i], "#fcf2af", "#fffbe7");
		}
		
		return elem("div", views);
	}
	
	var stack = error && error.stack ? filterRegExp(error.stack.split("\\n"), /^(\\s*at\\s+)?([^\\s@]*)\\s*@?\\s*\\(?\\s*([^)]+)\\)?$/) : [];
	
	if (stack[0] && !stack[0].startsWith(" ") && stack[0].indexOf("@") === -1) {
		stack.shift();
	}
	
	var closeButton = elem("button", ["x"], {
		"float": "right",
		border: "0",
		padding: "0 0.5em",
		margin: "0",
		background: "none",
		color: "#999999",
		font: "inherit",
		fontSize: "200%",
		cursor: "pointer"
	});
	
	closeButton.onclick = function() {
		if (container.parentNode) {
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
		color: "#333333",
		textAlign: "left"
	});
	document.body.appendChild(container);
};

window.onunhandledrejection = function(e) {
	var error = e.reason;
	window.onerror(
		error.message,
		error.fileName,
		error.lineNumber,
		error.columnNumber,
		error
	);
};
</script>`;

export const buildDevHotReloadScriptElement = ({
	apiPath,
	indexPath,
	reloadMethod = "POST",
	reloadPath = "reload"
}) => `<script type="text/javascript" language="javascript">
"use strict";
(function(document) {
	var unloaded = false;
	
	function unload() {
		unloaded = true;
	}
	
	if (window.addEventListener) {
		window.addEventListener("beforeunload", unload, false);
	} else if (window.attachEvent) {
		window.attachEvent("onbeforeunload", unload);
	}
	
	function applyStyle(src, version) {
		var stylesheets = document.styleSheets;
		
		for (var i = stylesheets.length; i--;) {
			var href = stylesheets[i].href;
			
			if (!href) {
				continue;
			}
			
			var pos = href.indexOf("?");
			
			if (~pos) {
				href = href.substring(0, pos);
			}
			
			href = href.replace(location.origin, "");
			
			if (href.charAt(0) !== "/") {
				href = "/" + href;
			}
			
			if (href === src) {
				var node = stylesheets[i].ownerNode;
				
				if (version) {
					var srcWithVersion = src + "?v=" + version;
					
					if (href !== srcWithVersion) {
						node.href = srcWithVersion;
					}
				} else {
					var parent = node.parentNode;
					
					if (parent) {
						parent.removeChild(node);
					}
				}
				
				return true;
			}
		}
		
		return false;
	}
	
	function updateStylesheets(parts) {
		var n = parts.length;
		
		if (n % 2 !== 0) {
			return;
		}
		
		for (var i = 0; i < n; i += 2) {
			if (!applyStyle(parts[i], parts[i+1])) {
				reloadPage();
			}
		}
	}
	
	function reloadPage() {
		if (unloaded) {
			return;
		}
		
		unload();
		
		if (location.pathname === "${indexPath}") {
			location.reload();
		} else {
			location.replace("${indexPath}" + location.hash);
		}
	}
	
	function watchReload() {
		var xhr = new XMLHttpRequest();
		
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 0 || xhr.readyState === 4) {
				xhr.onreadystatechange = null;
				
				if (unloaded) {
					return;
				}
				
				if (xhr.status === 200) {
					if (xhr.responseText) {
						updateStylesheets(xhr.responseText.split("\\n"));
					} else {
						reloadPage();
					}
				}
				
				watchReload();
			}
		};
		
		xhr.open("${reloadMethod}", "${apiPath}${reloadPath}", true);
		xhr.responseType = "text";
		xhr.send();
	}
	
	setTimeout(watchReload, 0);
})(document);
</script>`;

export const buildDevIndexHtml = ({
	config: {
		apiPath,
		htmlDebugToken,
		htmlHotReloadToken,
		htmlScriptToken,
		htmlStyleToken,
		indexHtmlFile,
		indexPath,
		srcDir,
		srcPath,
	},
	fileCache,
	html,
	libraryContainer,
	output,
}) => (html || buildTemplateIndexHtml({
	config: {
		srcDir,
		htmlHotReloadToken,
	},
	fileCache,
	templateFile: indexHtmlFile,
}))
	.replace(htmlDebugToken, () => buildDevDebugScriptElement())
	.replace(htmlHotReloadToken, () => buildDevHotReloadScriptElement({
		apiPath,
		fileCache,
		indexPath,
		srcDir,
		srcPath,
	}))
	.replace(htmlScriptToken, () => buildDevScriptElements({
		fileCache,
		libraryContainer,
		output,
		srcDir,
		srcPath,
	}))
	.replace(htmlStyleToken, () => buildDevLinkElements({
		fileCache,
		srcDir,
		srcPath,
	}))
;

export const buildDevLinkElements = ({
	fileCache,
	srcDir,
	srcPath,
}) => fileCache.keys()
	.filter(isCSS)
	.sort(comparePaths)
	.map((path) => `<link rel="stylesheet" href="${
		path.replace(srcDir + "/", srcPath) + "?v=" + fileCache.getVersion(path)
	}">`)
	.join("\n");

export const buildDevScriptElements = ({
	fileCache,
	libraryContainer,
	output,
	srcDir,
	srcPath,
}) => {
	const sourceFiles = fileCache
		.keys()
		.filter((path) => isJS(path) && !isReleaseJS(path) && !isTemplateJS(path))
		.sort(comparePaths);
	
	const source = sourceFiles
		.map((path) => fileCache.get(path))
		.join("\n");
	
	const libs = buildDevScriptLibraries({
		libraryContainer,
		source
	});
	
	const scripts = sourceFiles.map((path) => (
		`<script src="${
			path.replace(srcDir + "/", srcPath)
		}?v=${
			fileCache.getVersion(path)
		}"></script>`
	)).join("\n");
	
	const dataFiles = buildScriptDataFiles({
		fileCache,
		output,
		srcDir
	});
	
	const scriptContents = escapeScript(`\n"use strict";\n${libs}\n${dataFiles}`);
	
	return `<script>${scriptContents}</script>\n${scripts}`;
};

export const buildDevScriptLibraries = ({
	libraryContainer,
	source,
}) => libraryContainer
	.getLibraries(source)
	.map(lib => lib.source)
	.join("\n");

export const buildReleaseIndexHtml = ({
	config: {
		htmlDebugToken,
		htmlHotReloadToken,
		htmlScriptToken,
		htmlStyleToken,
		srcDir,
	},
	fileCache,
	filter,
	html,
	libraryContainer,
	output,
	templateFile,
}) => (html || buildTemplateIndexHtml({
	config: {
		srcDir,
		htmlHotReloadToken,
	},
	fileCache,
	templateFile,
}))
	.replace(htmlDebugToken, "")
	.replace(htmlHotReloadToken, "")
	.replace(htmlScriptToken, () => buildReleaseScriptElement({
		fileCache,
		filter,
		libraryContainer,
		output,
		srcDir,
	}))
	.replace(htmlStyleToken, () => buildReleaseStyleElement({
		fileCache,
		filter,
	}))
;

export const buildReleaseIndexJS = ({
	config: {
		jsAppToken,
		jsLibToken,
		srcDir,
	},
	fileCache,
	filter,
	includeLibraries,
	js,
	libraryContainer,
	output,
	templateFile,
}) => (js || buildTemplateIndexJS({
	config: {
		srcDir,
		jsAppToken,
		jsLibToken,
	},
	fileCache,
	templateFile,
})).replace(jsLibToken, () => {
	const source = buildReleaseScriptWithoutLibraries({
		fileCache,
		filter,
		output,
		srcDir,
	});
	
	return buildReleaseScriptLibraries({
		libraryContainer,
		source,
	});
}).replace(jsAppToken, () => includeLibraries
	? buildReleaseScript({
		fileCache,
		filter,
		libraryContainer,
		output,
		srcDir,
	})
	: buildReleaseScriptWithoutLibraries({
		fileCache,
		filter,
		output,
		srcDir,
	})
);

export const buildReleaseScript = ({
	fileCache,
	filter,
	libraryContainer,
	output,
	srcDir,
}) => {
	const source = buildReleaseScriptWithoutLibraries({
		fileCache,
		filter,
		output,
		srcDir,
	});
	const libs = buildReleaseScriptLibraries({
		libraryContainer,
		source,
	});
	return `"use strict";\n${libs}\n${source}`;
};

export const buildReleaseScriptElement = ({
	fileCache,
	filter,
	libraryContainer,
	output,
	srcDir,
}) => {
	const code = escapeScript(
		buildReleaseScript({
			fileCache,
			filter,
			libraryContainer,
			output,
			srcDir,
		})
	);
	
	return `<script>\n${code}\n</script>`;
};

export const buildReleaseScriptLibraries = ({
	libraryContainer,
	source,
}) => (
	minifyLibrary(
		buildDevScriptLibraries({libraryContainer, source})
	)
);

export const buildReleaseScriptWithoutLibraries = ({
	fileCache,
	filter = (path) => true,
	output,
	srcDir,
}) => (
	buildScriptDataFiles({
		fileCache,
		filter,
		output,
		srcDir,
	}) +
	fileCache
		.keys()
		.filter(path => isJS(path) && !isTestJS(path) && !isTemplateJS(path) && filter(path))
		.sort(comparePaths)
		.map(path => fileCache.get(path))
		.join("\n")
);

export const buildReleaseStyleElement = ({
	fileCache,
	filter = (path) => true,
}) => {
	const source = fileCache.keys()
		.filter(path => isCSS(path) && filter(path))
		.sort(comparePaths)
		.map(path => fileCache.get(path))
		.join("\n");
	
	const code = escapeStyle(minifyCSS(source));
	
	return `<style>${code}</style>`;
};

export const buildScriptDataFiles = ({
	fileCache,
	filter = (path) => true,
	output,
	srcDir,
}) => {
	const keys = fileCache.keys().filter(filter);
	const txtFiles = keys.filter(isTXT).sort(comparePaths);
	const jsonFiles = keys.filter(isJSON).sort(comparePaths);
	
	const txts = txtFiles.map(
		path => (
			"\"" +
			escapeString(path.replace(srcDir + "/", "")) +
			"\":\"" +
			escapeString(fileCache.get(path)) +
			"\","
		)
	);
	
	const jsons = jsonFiles.map(path => {
		const jsonString = fileCache.get(path);
		
		try {
			JSON.parse(jsonString);
			return (
				"\"" +
				escapeString(path.replace(srcDir + "/", "")) +
				"\":" +
				jsonString +
				","
			);
		} catch (ex) {
			output.warnInvalidJSON(path);
			return "";
		}
	});
	
	const all = [
		...txts,
		...jsons,
	];
	
	return all.length > 0 ? "$.data={" + all.join("").slice(0, -1) + "};\n" : "";
};

export const buildTemplateIndexHtml = ({
	config: {
		srcDir,
		htmlHotReloadToken,
	},
	fileCache,
	templateFile,
}) => fileCache.get(srcDir + "/" + templateFile) || `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>vKit CLI - Development Server</title>
		${htmlHotReloadToken}
	</head>
	<body>
		<h1>${templateFile} missing</h1>
		<p>Create a file named '${
			templateFile
		}' in the '${
			srcDir
		}' directory.</p>
	</body>
</html>`;

export const buildTemplateIndexJS = ({
	config: {
		srcDir,
		jsAppToken,
	},
	fileCache,
	templateFile,
}) => fileCache.get(srcDir + "/" + templateFile) || jsAppToken;
