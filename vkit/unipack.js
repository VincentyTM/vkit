(function($) {

var effect = $.effect;
var onUnmount = $.onUnmount;
var readOnly = $.readOnly;
var signal = $.signal;
var thenable = $.thenable;
var update = $.update;

function pack(files) {
	var r = /\n/g;
	var n = files.length;
	var m = n << 2;
	var header = new Array(m);
	var j = 0;
	
	for (var i = 0; i < n; ++i) {
		var file = files[i];
		header[j++] = file.name.replace(r, "");
		header[j++] = file.size;
		header[j++] = file.type.replace(r, "");
		header[j++] = file.lastModified;
	}
	
	header = new Blob([header.join("\n")]);
	var size = header.size;
	var sizeBytes = new Uint8Array(6);
	
	for (var i = 5; i >= 0; --i) {
		sizeBytes[i] = size & 255;
		size >>= 8;
	}
	
	return new Blob([sizeBytes, header].concat(files));
}

function unpack(currentFile, options) {
	var result = signal({});
	var progress = signal();
	var progressReadonly = readOnly(progress);
	var reader = new FileReader();
	var file;
	var s;
	
	reader.onprogress = function(e) {
		handleProgress(e);
		update();
	};
	
	reader.onload = function() {
		if (typeof reader.result === "string") {
			var res = reader.result.split("\n");
			var data = [];
			
			for (var i = 0, l = res.length; i < l; i += 4) {
				if (isNaN(res[i+1]) || isNaN(res[i+3])) {
					reject(new Error("Invalid package: header cannot be parsed."));
					update();
					return;
				}
				
				var blob = file.slice(s, s += +res[i+1], res[i+2]);
				blob.name = res[i];
				blob.lastModified = +res[i+3];
				data.push(blob);
			}
			
			if (s !== file.size) {
				reject(new Error("Invalid package: sum of file sizes does not match package size."));
				update();
				return;
			}
			
			result.set({fulfilled: true, value: data});
		} else {
			s = 0;
			var u = new Uint8Array(reader.result);
			
			for (var i = 0, l = u.length; i < l; ++i) {
				s = s << 8 | u[i];
			}
			
			if (s >= 0 && (s += 6) <= file.size) {
				reader.readAsText(file.slice(6, s));
			} else {
				reject(new Error("Invalid package: header size exceeds file size."));
			}
		}
		
		update();
	};
	
	reader.onerror = function() {
		reject(reader.error);
		update();
	};
	
	function reject(error) {
		result.set({
			rejected: true,
			error: error
		});
	}
	
	function handleProgress(e) {
		progress.set(e);
	}
	
	function setFile(f) {
		reader.abort();
		
		if (f) {
			if (f.size < 6) {
				reject(new Error("Invalid package: file shorter than 6 bytes."));
			} else {
				progress.set({
					loaded: 0,
					total: 0,
					lengthComputable: false
				});
				
				result.set({
					pending: true,
					progress: progressReadonly,
					abort: abort
				});
				
				file = f;
				reader.readAsArrayBuffer(f.slice(0, 6));
			}
		} else {
			result.set({});
		}
	}
	
	function abort() {
		reader.onerror = null;
		reader.onload = null;
		reader.onprogress = null;
		reader.abort();
	}
	
	if (typeof currentFile === "function") {
		if (typeof currentFile.effect === "function") {
			currentFile.effect(setFile);
		} else {
			effect(function() {
				setFile(currentFile());
			});
		}
	} else {
		setFile(currentFile);
	}
	
	if (options && typeof options.aborter === "function") {
		options.aborter(abort);
	} else {
		onUnmount(abort);
	}
	
	return thenable(readOnly(result));
}

$.unipack = {
	pack: pack,
	unpack: unpack
};

})($);
