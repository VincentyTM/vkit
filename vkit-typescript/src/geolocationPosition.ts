import { AsyncResult, AsyncStatus } from "./asyncEffect.js";
import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { signal } from "./signal.js";

export function geolocationPosition(options?: PositionOptions): Signal<AsyncResult<GeolocationPosition>> {
	var win = getWindow();
	var result = signal<AsyncResult<GeolocationPosition>>({status: AsyncStatus.Pending});
	
	function updatePosition(position: GeolocationPosition): void {
		result.set({
			status: AsyncStatus.Resolved,
			value: position
		});
	}
	
	function handleError(error: unknown): void {
		result.set({
			status: AsyncStatus.Rejected,
			error: error
		});
	}
	
	if (win) {
		var geolocation = win.navigator.geolocation;

		if (geolocation) {
			var id = geolocation.watchPosition(updatePosition, handleError, options);
			
			onDestroy(function(): void {
				geolocation.clearWatch(id);
			});
		} else {
			handleError(new ReferenceError("GeoLocation API is not supported"));
		}
	}

	return result;
}
