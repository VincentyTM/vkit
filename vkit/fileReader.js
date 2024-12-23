(function($) {

var effect = $.effect;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var update = $.update;

function createFileReader(input, options) {
	function abort() {
		reader.abort();
	}
	
	function updateOutput(value) {
		abort();
		
		if (value) {
			output.set({
				progress: signal({
					lengthComputable: false,
					loaded: 0,
					total: 0
				}),
				abort: abort
			});
			
			var as = value.as || (options ? options.as : null) || "text";
			var file = value.file || value;
			
			switch (as) {
				case "arrayBuffer": reader.readAsArrayBuffer(file); break;
				case "binaryString": reader.readAsBinaryString(file); break;
				case "dataURL": reader.readAsDataURL(file); break;
				case "text": reader.readAsText(file); break;
				default: reader.readAsText(file);
			}
		} else {
			output.set({});
		}
	}
	
	var output = signal();
	var reader = new FileReader();
	
	reader.onerror = function() {
		output.set({
			error: reader.error
		});
		
		if (typeof unsubscribe === "function") {
			unsubscribe();
		}
		
		update();
	};
	
	reader.onload = function() {
		output.set({
			result: reader.result
		});
		
		if (typeof unsubscribe === "function") {
			unsubscribe();
		}
		
		update();
	};
	
	reader.onprogress = function(e) {
		output.get().progress.set(e);
		update();
	};
	
	if (typeof input === "function") {
		if (typeof input.effect === "function") {
			input.effect(updateOutput);
		} else {
			effect(function() {
				updateOutput(input());
			});
		}
	} else {
		updateOutput(input);
	}
	
	var unsubscribe = options && typeof options.aborter === "function"
		? options.aborter(abort)
		: onUnmount(abort);
	
	return readOnly(output);
}

$.fileReader = createFileReader;

})($);
