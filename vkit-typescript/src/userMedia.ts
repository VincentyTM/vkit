import { AsyncStatus, asyncEffect, AsyncResult } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { effect } from "./effect.js";
import { getWindow } from "./getWindow.js";
import { isSignal } from "./isSignal.js";
import { onDestroy } from "./onDestroy.js";

function stopTrack(track: MediaStreamTrack): void {
	track.stop();
}

export function userMedia(
	constraints: MediaStreamConstraints | null | Signal<MediaStreamConstraints | null> | (() => MediaStreamConstraints | null),
	displayMedia?: boolean
): Signal<AsyncResult<MediaStream | null>> {
	var latestStream = asyncEffect<MediaStream | null>(function() {
		var win = getWindow();

		if (!win) {
			return null;
		}

		var currentConstraints = isSignal(constraints) || typeof constraints === "function" ? constraints() : constraints;

		if (currentConstraints === null) {
			return null;
		}

		var nav = win.navigator;

		if(
			!nav.mediaDevices ||
			(!displayMedia && typeof nav.mediaDevices.getUserMedia !== "function") ||
			(displayMedia && typeof nav.mediaDevices.getDisplayMedia !== "function")
		) {
			throw new Error("MediaDevices API is not supported");
		}

		return displayMedia
			? nav.mediaDevices.getDisplayMedia(currentConstraints)
			: nav.mediaDevices.getUserMedia(currentConstraints);
	});

	effect(function(): void {
		var streamResult = latestStream();

		if (streamResult.status === AsyncStatus.Resolved && streamResult.value !== null) {
			var stream = streamResult.value;

			onDestroy(function(): void {
				stream.getTracks().forEach(stopTrack);
			});
		}
	});

	return latestStream;
}
