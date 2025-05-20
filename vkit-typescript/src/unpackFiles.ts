import { AsyncResult, AsyncStatus, Progress } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

export function unpackFiles(
	currentFile: Blob | null | Signal<Blob | null> | (() => Blob | null)
): Signal<AsyncResult<File[]>> {
	var win = getWindow();
	var result = signal<AsyncResult<File[]>>({status: AsyncStatus.Pending});

	if (win === null) {
		return result;
	}

	if (typeof win.FileReader !== "function") {
		result.set({
			error: new Error("FileReader API is not supported"),
			status: AsyncStatus.Rejected
		});
	}

	var progress = signal<Progress>({
		lengthComputable: false,
		loaded: 0,
		total: 0
	});
	var reader = new win.FileReader();
	var file: Blob;
	var s: number;
	
	reader.onprogress = function(e): void {
		progress.set(e);
	};
	
	reader.onload = function(): void {
		if (typeof reader.result === "string") {
			var res = reader.result.split("\n");
			var data: File[] = [];
			
			for (var i = 0, l = res.length; i < l; i += 4) {
				if (isNaN(Number(res[i+1])) || isNaN(Number(res[i+3]))) {
					result.set({
						error: new Error("Invalid package: header cannot be parsed."),
						status: AsyncStatus.Rejected
					});
					return;
				}
				
				var blob = file.slice(s, s += +res[i+1], res[i+2]);
				(blob as any).name = res[i];
				(blob as any).lastModified = +res[i+3];
				(blob as any).webkitRelativePath = "";
				data.push(blob as File);
			}
			
			if (s !== file.size) {
				result.set({
					error: new Error("Invalid package: sum of file sizes does not match package size."),
					status: AsyncStatus.Rejected
				});
				return;
			}
			
			result.set({
				status: AsyncStatus.Resolved,
				value: data
			});
			return;
		}

		if (reader.result === null) {
			return;
		}

		s = 0;
		var u = new Uint8Array(reader.result);
		
		for (var i = 0, l = u.length; i < l; ++i) {
			s = s << 8 | u[i];
		}
		
		if (s >= 0 && (s += 6) <= file.size) {
			reader.readAsText(file.slice(6, s));
		} else {
			result.set({
				error: new Error("Invalid package: header size exceeds file size."),
				status: AsyncStatus.Rejected
			});
		}
	};
	
	reader.onerror = function(): void {
		result.set({
			error: reader.error,
			status: AsyncStatus.Rejected
		});
	};
	
	effect(function(): void {
		var f = typeof currentFile === "function" ? currentFile() : currentFile;

		reader.abort();
		
		if (f !== null) {
			if (f.size < 6) {
				result.set({
					error: new Error("Invalid package: file shorter than 6 bytes."),
					status: AsyncStatus.Rejected
				});
			} else {
				progress.set({
					loaded: 0,
					total: 0,
					lengthComputable: false
				});
				
				result.set({
					progress: progress,
					status: AsyncStatus.Pending
				});
				
				file = f;
				reader.readAsArrayBuffer(f.slice(0, 6));
			}
		} else {
			result.set({
				status: AsyncStatus.Pending
			});
		}
	});
	
	onDestroy(function(): void {
		reader.onerror = null;
		reader.onload = null;
		reader.onprogress = null;
		reader.abort();
	});
	
	return result;
}
