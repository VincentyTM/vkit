import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal } from "./signal.js";

const enum AsyncStatus {
	Rejected,
	Resolved,
}

type AsyncResult<T> = RejectedAsyncResult | ResolvedAsyncResult<T>;

interface RejectedAsyncResult {
	status: AsyncStatus.Rejected;
	error: unknown;
}

interface ResolvedAsyncResult<T> {
	status: AsyncStatus.Resolved;
	value: T;
}

function getEmptyList(): [] {
	return [];
}

/**
 * Returns a reactive signal containing an array of all available media devices.
 * The list updates automatically when devices are connected or disconnected.
 * If rendered on the server, the list will be empty.
 * If an error occurs while attempting to read or use the device list,
 * the error will be propagated.
 * 
 * @example
 * function AudioInputSelector() {
 * 	const devices = mediaDevices();
 * 	const audioInputs = computed(() =>
 * 		devices().filter(
 * 			d => d.kind === "audioinput"
 * 		)
 * 	);
 * 
 * 	return Select(
 * 		Option({
 * 			label: "- None selected -",
 * 			value: ""
 * 		}),
 * 		viewList(devices, device => Option({
 * 			label: device.label,
 * 			value: device.deviceId
 * 		}))
 * 	);
 * }
 * 
 * @returns A signal containing an array of available `MediaDeviceInfo` objects.
 */
export function mediaDevices(): Signal<MediaDeviceInfo[]> {
	var win = getWindow();

	if (!win) {
		return computed(getEmptyList);
	}

	var nav = win.navigator;
	var result = signal<AsyncResult<MediaDeviceInfo[]>>({
		status: AsyncStatus.Resolved,
		value: []
	});

	function fetchDevices(): void {
		nav.mediaDevices.enumerateDevices().then(function(list: MediaDeviceInfo[]) {
			result.set({
				status: AsyncStatus.Resolved,
				value: list
			});
		}, function(error) {
			result.set({
				status: AsyncStatus.Rejected,
				error: error
			});
		});
	}

	if (nav.mediaDevices && typeof nav.mediaDevices.enumerateDevices === "function") {
		onDestroy(
			onEvent(nav.mediaDevices, "devicechange", fetchDevices)
		);
		fetchDevices();
	} else {
		result.set({
			status: AsyncStatus.Rejected,
			error: new Error("MediaDevices API is not supported")
		});
	}

	return computed(function(result: AsyncResult<MediaDeviceInfo[]>): MediaDeviceInfo[] {
		if (result.status === AsyncStatus.Rejected) {
			throw result.error;
		}

		return result.value;
	}, [result]);
}
