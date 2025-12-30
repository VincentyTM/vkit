export function packFiles(files: File[]): Blob {
	var r = /\n/g;
	var n = files.length;
	var m = n << 2;
	var header = new Array<string | number>(m);
	var j = 0;

	for (var i = 0; i < n; ++i) {
		var file = files[i];
		header[j++] = file.name.replace(r, "");
		header[j++] = file.size;
		header[j++] = file.type.replace(r, "");
		header[j++] = file.lastModified;
	}

	var headerBlob = new Blob([header.join("\n")]);
	var size = headerBlob.size;
	var sizeBytes = new Uint8Array(6);

	for (var i = 5; i >= 0; --i) {
		sizeBytes[i] = size & 255;
		size >>= 8;
	}

	return new Blob([sizeBytes, headerBlob].concat(files));
}
