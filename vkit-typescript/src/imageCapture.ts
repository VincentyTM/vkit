import { computed, Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";

interface ImageCapture {
	takePhoto(photoSettings?: ImageCapturePhotoSettings): Promise<Blob>;
}

interface ImageCaptureConfig {
	photoSettings: ImageCapturePhotoSettings | null | Signal<ImageCapturePhotoSettings | null>;
	stream: MediaStream | MediaStreamTrack | null | Signal<MediaStream | MediaStreamTrack | null> | (() => MediaStream | MediaStreamTrack | null);
	onCapture: (blob: Blob) => void;
	onError: (error: unknown) => void;
}

interface ImageCapturePhotoSettings {
	fillLightMode?: "auto" | "off" | "flash";
	imageHeight?: number;
	imageWidth?: number;
	redEyeReduction?: boolean;
}

function takePhoto(
	ctx: CanvasRenderingContext2D,
	video: HTMLVideoElement,
	resolve: (blob: Blob) => void
): void {
	ctx.drawImage(video, 0, 0);
	ctx.canvas.toBlob(function(blob: Blob | null): void {
		if (blob === null) {
			return;
		}

		if (typeof Promise === "function") {
			Promise.resolve(blob).then(resolve);
			return;
		}

		setTimeout(function() {
			resolve(blob);
		}, 0);
	});
}

function ImageCapturePolyfill(track: MediaStreamTrack): ImageCapture {
	var takePhotoCallbacks: ((blob: Blob) => void)[] = [];
	var stream = new MediaStream([track]);
	var canvas = document.createElement("canvas");
	var ctxInit = canvas.getContext("2d");

	if (ctxInit === null) {
		throw new Error("Canvas context could not be created");
	}

	var ctx = ctxInit;
	var video = document.createElement("video");
	video.muted = true;
	video.srcObject = stream;

	video.oncanplay = function(): void {
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		video.play();
	};

	video.onplay = function(): void {
		var callbacks = takePhotoCallbacks;
		var n = callbacks.length;

		takePhotoCallbacks = [];

		for (var i = 0; i < n; ++i) {
			takePhoto(ctx, video, callbacks[i]);
		}
	};

	return {
		takePhoto: function() {
			return new Promise(function(resolve) {
				if (video.paused) {
					takePhotoCallbacks.push(resolve);
				} else {
					takePhoto(ctx, video, resolve);
				}
			});
		}
	};
}

function createImageCapture(stream: MediaStream | MediaStreamTrack, win: Window | null): ImageCapture {
	if (win === null) {
		throw new Error("Window is not available");
	}

	var track = "getVideoTracks" in stream ? stream.getVideoTracks()[0] : stream;

	if (track === undefined) {
		throw new Error("No video track in stream");
	}

	if (typeof (win as any).ImageCapture === "function") {
		return new (win as any).ImageCapture(track) as ImageCapture;
	}

	return ImageCapturePolyfill(track);
}

export function imageCapture(config: ImageCaptureConfig): void {
	var win = getWindow();
	var photoSettings = config.photoSettings;
	var stream = config.stream;
	var onCapture = config.onCapture;
	var onError = config.onError;

	var imageCapture = computed(function() {
		var s = isSignal(stream) || typeof stream === "function" ? stream() : stream;
		return s === null ? null : createImageCapture(s, win);
	});

	var destroyed = false;
	var pending = false;

	effect(function() {
		var ic = imageCapture();
		var ps = isSignal(photoSettings) || typeof photoSettings === "function" ? photoSettings() : photoSettings;

		if (ic === null || ps === null) {
			return;
		}

		if (!pending) {
			pending = true;
			ic.takePhoto(ps).then(handleBlob, handleError);
		}
	});

	function handleBlob(blob: Blob): void {
		if (destroyed) {
			return;
		}

		pending = false;

		if (blob.size > 0) {
			onCapture(blob);
		} else {
			onError(new Error("Empty file"));
		}
	}

	function handleError(error: unknown): void {
		if (destroyed) {
			return;
		}

		pending = false;
		onError(error);
	}

	onDestroy(function() {
		destroyed = true;
	});
}
