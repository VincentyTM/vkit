import { AsyncResult, AsyncStatus, Progress } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { isSignal } from "./isSignal";
import { onDestroy } from "./onDestroy.js";
import { signal, WritableSignal } from "./signal.js";

interface FileReaderOptions<T extends FileReaderResultType | undefined> {
	as?: T;
}

type FileReaderResult<T extends FileReaderResultType | undefined> = (
	T extends "arrayBuffer" ? ArrayBuffer :
	T extends "binaryString" | "dataURL" | "text" | undefined ? string :
	ArrayBuffer | string
);

type FileReaderResultType = "arrayBuffer" | "binaryString" | "dataURL" | "text";

export function fileReader<T extends FileReaderResultType>(
	file: Blob | null | Signal<Blob | null> | (() => Blob | null),
	options?: FileReaderOptions<T>
): Signal<AsyncResult<FileReaderResult<T>>> {
	var result = signal<AsyncResult<FileReaderResult<T>>>({status: AsyncStatus.Pending});
	var progress = signal<Progress>({
		lengthComputable: false,
		loaded: 0,
		total: 0
	});
	var as = options && options.as;
	
	effect(function(): void {
		var reader = new FileReader();
		
		reader.onerror = function(): void {
			result.set({
				status: AsyncStatus.Rejected,
				error: reader.error
			});
		};
		
		reader.onload = function(): void {
			result.set({
				status: AsyncStatus.Resolved,
				value: reader.result as FileReaderResult<T>
			});
		};
		
		reader.onprogress = function(e): void {
			progress.set(e);
		};

		effect(function(): void {
			updateFileReader(
				reader,
				result,
				isSignal(file) || typeof file === "function" ? file() : file,
				as || "text",
				progress
			);
		});
		
		onDestroy(function(): void {
			reader.abort();
		});
	});
	
	return result;
}

function updateFileReader<T extends FileReaderResultType>(
	reader: FileReader,
	result: WritableSignal<AsyncResult<FileReaderResult<T>>>,
	file: Blob | null,
	as: T,
	progress: Signal<Progress>
): void {
	reader.abort();
	
	if (file === null) {
		result.set({status: AsyncStatus.Pending});
	} else {
		result.set({
			status: AsyncStatus.Pending,
			progress: progress
		});
		
		switch (as) {
			case "arrayBuffer": reader.readAsArrayBuffer(file); break;
			case "binaryString": reader.readAsBinaryString(file); break;
			case "dataURL": reader.readAsDataURL(file); break;
			case "text": reader.readAsText(file); break;
			default: reader.readAsText(file);
		}
	}
}
