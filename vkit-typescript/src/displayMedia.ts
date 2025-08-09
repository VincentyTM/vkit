import { AsyncResult } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { userMedia } from "./userMedia.js";

export function displayMedia(
	constraints: MediaStreamConstraints | null | Signal<MediaStreamConstraints | null> | (() => MediaStreamConstraints | null)
): Signal<AsyncResult<MediaStream | null>> {
	return userMedia(constraints, true);
}
