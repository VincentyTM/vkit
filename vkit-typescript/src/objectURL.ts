import { effect } from "./effect.js";
import { onDestroy } from "./onDestroy.js";
import { signal, Signal } from "./signal.js";

interface URLType {
    createObjectURL(obj: Blob | MediaSource): string;
    revokeObjectURL(url: string): void;
}

type URLSource = string | Blob | MediaSource;

declare var mozURL: URLType;

var URLWithFallback: URLType = (
    typeof URL === "function" ? URL :
    typeof webkitURL === "function" ? webkitURL :
    typeof mozURL === "function" ? mozURL :
    {
        createObjectURL: function() { return ""; },
        revokeObjectURL: function() {}
    }
);

export function objectURL(file: URLSource): string;

export function objectURL(file: Signal<URLSource | null> | (() => URLSource | null)): Signal<string>;

export function objectURL(file: URLSource | Signal<URLSource | null> | (() => URLSource | null)): string | Signal<string> {
	if (typeof file === "string") {
		return file;
	}

	if (typeof file !== "function") {
		var url = URLWithFallback.createObjectURL(file);

		onDestroy(function(): void {
			URLWithFallback.revokeObjectURL(url);
		});

		return url;
	}

	var urlSignal = signal("");

	effect(function(): void {
		var value = file();

		if (value === null) {
			urlSignal.set("");
			return;
		}

		if (typeof value === "string") {
			urlSignal.set(value);
			return;
		}

		var url = URLWithFallback.createObjectURL(value);

		urlSignal.set(url);

		onDestroy(function(): void {
			URLWithFallback.revokeObjectURL(url);
		});
	});

	return urlSignal;
}
