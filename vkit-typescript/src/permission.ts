import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal } from "./signal.js";

export type PermissionPrompt = (
	| DefaultPermissionPrompt
	| DeniedPermissionPrompt
	| GrantedPermissionPrompt
	| PromptPermissionPrompt
);

interface DefaultPermissionPrompt {
	readonly state: "default";
}

interface DeniedPermissionPrompt {
	readonly denied: true;
	readonly state: "denied";
}

interface GrantedPermissionPrompt {
	readonly granted: true;
	readonly state: "granted";
}

interface PromptPermissionPrompt {
	readonly prompt: true;
	readonly state: "prompt";
	request(): void;
	dismiss(): void;
}

export function permission(
	name: PermissionName,
	onRequestPermission: (grant: () => void, deny: () => void) => void,
	onError?: (error: unknown) => void
): Signal<PermissionPrompt> {
	function grant(): void {
		if (permission.get() === "prompt") {
			permission.set("granted");
		}
	}
	
	function deny(): void {
		if (permission.get() === "prompt") {
			permission.set("denied");
		}
	}
	
	function request(): void {
		if (permission.get() === "prompt") {
			onRequestPermission(grant, deny);
		}
	}
	
	function dismiss(): void {
		if (permission.get() === "prompt") {
			permission.set("default");
		}
	}
	
	var permission = signal<PermissionState | "default">("default");
	
	var prompt = permission.map(function(perm: PermissionState | "default"): PermissionPrompt {
		if (perm === "granted") {
			return {
				state: "granted",
				granted: true
			};
		}
		
		if (perm === "denied") {
			return {
				state: "denied",
				denied: true
			};
		}
		
		if (perm === "prompt") {
			return {
				state: "prompt",
				prompt: true,
				request: request,
				dismiss: dismiss
			};
		}
		
		return {
			state: "default"
		};
	});
	
	var unsubscribe: (() => void) | undefined;
	
	onDestroy(function(): void {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	var win = getWindow();
	
	if (win && win.navigator && win.navigator.permissions) {
		win.navigator.permissions.query({name: name}).then(function(perm: PermissionStatus): void {
			permission.set(perm.state || (perm as any).status);
			
			unsubscribe = onEvent(perm, "change", function(): void {
				permission.set(perm.state || (perm as any).status);
			});
		}, function(error: unknown): void {
			if (typeof onError === "function") {
				onError(error);
			}
		});
	}
	
	return prompt;
}
