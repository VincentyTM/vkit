import { asyncEffect, AsyncResult, Suspend } from "./asyncEffect.js";
import { awaitResult } from "./awaitResult.js";
import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";

interface ImageCapture {
	takePhoto(photoSettings?: ImageCapturePhotoSettings): Promise<Blob>;
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
};

export function imageCapture(
	stream: MediaStream | MediaStreamTrack | null | Signal<MediaStream | MediaStreamTrack | null> | (() => MediaStream | MediaStreamTrack | null),
	photoSettings: ImageCapturePhotoSettings | null | Signal<ImageCapturePhotoSettings | null>
): Signal<AsyncResult<Blob>> {
	var win = getWindow();

	var imageCapture = asyncEffect(function() {
		if (win === null) {
			throw new Error("Window is not available");
		}

		var s = isSignal(stream) || typeof stream === "function" ? stream() : stream;

		if (s === null) {
			return null;
		}

		var track = "getVideoTracks" in s ? s.getVideoTracks()[0] : s;

		if (!track) {
			throw new Error("No video track in stream");
		}

		if (typeof (win as any).ImageCapture === "function") {
			return new (win as any).ImageCapture(track) as ImageCapture;
		}

		return ImageCapturePolyfill(track);
	});

	return asyncEffect(function() {
		var ic = awaitResult(imageCapture());
		var ps = isSignal(photoSettings) || typeof photoSettings === "function" ? photoSettings() : photoSettings;

		if (!ic || !ps) {
			throw Suspend;
		}

		return ic.takePhoto(ps);
	});
}
