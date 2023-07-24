module.exports = () => `<script type="text/javascript" language="javascript">
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
		line = line.replace("new ", "");
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
window.onunhandledrejection = function(e){
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
