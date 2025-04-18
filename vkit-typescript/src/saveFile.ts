import { URLWithFallback } from "./objectURL.js";

/**
 * Saves/downloads the provided file or blob (binary large object).
 * It may open a file saving dialog, depending on the browser settings.
 * 
 * For security reasons, many browsers only allow saving a file after a user event (e.g. click).
 * @example
 * function FileSaver() {
 * 	const myBlob = new Blob(["Hello world"]);
 * 	
 * 	return Button("Save", {
 * 		onclick: () => saveFile(myBlob, "HelloWorld.txt")
 * 	});
 * }
 * @param blob The blob/file to save.
 * @param name A name for the saved file.
 * It is optional if the given blob is a file (and hence it has a name).
 * In that case, the file's own name is used if this parameter is not provided.
 */
export function saveFile(blob: File, name?: string): void;

export function saveFile(blob: Blob, name: string): void;

export function saveFile(blob: Blob, name?: string): void {
	if ((navigator as any).msSaveOrOpenBlob) {
		(navigator as any).msSaveOrOpenBlob(blob, name);
		return;
	}
	
	var url = URLWithFallback.createObjectURL(blob);
	var a = document.createElement("a");
	a.href = url;
	a.download = name || (blob as File).name || "file";
	a.click();
	URLWithFallback.revokeObjectURL(url);
}
