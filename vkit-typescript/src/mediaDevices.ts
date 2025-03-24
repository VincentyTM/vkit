import { computed } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal, Signal } from "./signal.js";

enum AsyncStatus {
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
