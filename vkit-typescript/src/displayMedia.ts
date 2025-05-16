import { AsyncResult } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { userMedia } from "./userMedia.js";

export function displayMedia(
	constraints: DisplayMediaStreamConstraints | null | Signal<DisplayMediaStreamConstraints | null> | (() => DisplayMediaStreamConstraints | null)
): Signal<AsyncResult<MediaStream | null>> {
	return userMedia(constraints, true);
}
