(function($) {

var observable = $.observable;
var onUnmount = $.onUnmount;

function replaceScriptEnds(text) {
	return "<\\" + text.substring(1);
}

function createSandbox(code, sandboxFlags) {
	if (!code) {
		code = "";
	}
	
	var emitRun = observable();
	
	function run(newCode) {
		if (typeof newCode === "string") {
			code = newCode;
		}
		emitRun(code);
	}
	
	function bind(iframe) {
		function runCode(c) {
			c = c.replace(/<\/script\b/ig, replaceScriptEnds);
			
			var prefix = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><script>';
			var suffix = '<\/script></body></html>';
			
			if ("srcdoc" in iframe) {
				iframe.srcdoc = prefix + c + suffix;
			} else {
				iframe.src = 'data:text/html;charset=UTF-8,' + prefix + c + suffix;
			}
		}
		
		iframe.sandbox = sandboxFlags || "allow-scripts";
		onUnmount(emitRun.subscribe(runCode));
		runCode(code);
	}
	
	function render() {
		return bind;
	}
	
	return {
		run: run,
		render: render
	};
}

$.sandbox = createSandbox;

})($);
