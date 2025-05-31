import { computed, Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { noop } from "./noop.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal } from "./signal.js";

interface NotificationManager {
	permission: Signal<NotificationPermissionState>;
	dismiss(): void;
	granted(): boolean;
	requestPermission(): void;
	show(title: string, options?: NotificationOptions): Notification | null;
}

interface NotificationManagerOptions {
	onError?(error: unknown): void;
}

type NotificationPermissionState = "default" | "denied" | "granted" | "prompt";

export function notification(options?: NotificationManagerOptions): NotificationManager {
	var win = getWindow();
	
	if (win === null) {
		return {
			dismiss: noop,
			granted: function(): boolean {
				return false;
			},
			permission: computed(function(): NotificationPermissionState {
				return "default";
			}),
			requestPermission: noop,
			show: function(): null {
				return null;
			}
		};
	}
	
	var nav = win.navigator;
	var Notification = win.Notification;
	var isSupported = typeof Notification === "function";
	
	var permission = signal<NotificationPermissionState>(
		isSupported
			? (Notification.permission === "default" ? "prompt" : Notification.permission)
			: "default"
	);
	
	var unsubscribe: (() => void) | undefined;
	
	onDestroy(function(): void {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	var onError = options && options.onError;
	
	if (nav.permissions) {
		nav.permissions.query({name: "notifications"}).then(function(perm: PermissionStatus): void {
			var state: PermissionState | "default" = perm.state || (perm as any).status;
			
			if (Notification.permission === "denied" && state === "prompt") {
				state = "default";
			}
			
			permission.set(state);
			
			unsubscribe = onEvent(perm, "change", function(): void {
				var state: PermissionState | "default" = perm.state || (perm as any).status;
				
				if (Notification.permission === "denied" && state === "prompt") {
					state = "default";
				}
				
				permission.set(state);
			});
		}, onError);
	}
	
	function request(): void {
		if (isSupported && Notification.permission !== "granted" && permission.get() === "prompt") {
			Notification.requestPermission(function(perm): void {
				permission.set(perm === "default" ? "prompt" : perm);
			});
		}
	}
	
	function dismiss(): void {
		if (permission.get() === "prompt") {
			permission.set("default");
		}
	}
	
	function granted(): boolean {
		return permission.get() === "granted";
	}
	
	function showNotification(
		title: string,
		options?: NotificationOptions
	): Notification | null {
		if (!isSupported) {
			if (typeof onError === "function") {
				onError(new Error("Notification API is not supported"));
			}
			
			return null;
		}
		
		if (!granted()) {
			if (typeof onError === "function") {
				onError(new Error("Notifications are not granted by the user"));
			}
			
			return null;
		}
		
		try {
			return new Notification(title, options);
		} catch(ex) {
			if (nav.serviceWorker) {
				nav.serviceWorker.ready.then(function(reg: ServiceWorkerRegistration): Promise<void> {
					return reg.showNotification(title, options);
				}, onError);
			} else if (typeof onError === "function") {
				onError(ex);
			}
			
			return null;
		}
	}
	
	return {
		permission: permission,
		dismiss: dismiss,
		granted: granted,
		requestPermission: request,
		show: showNotification
	};
}
