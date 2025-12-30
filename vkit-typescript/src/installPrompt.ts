import { Signal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { signal } from "./signal.js";
import { update } from "./update.js";

type BeforeInstallPromptStatus = "default" | "dismissed" | "installed";

type BeforeInstallPromptOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptChoiceResult {
	readonly outcome: BeforeInstallPromptOutcome;
}

interface BeforeInstallPromptEvent extends Event {
	readonly userChoice: Promise<BeforeInstallPromptChoiceResult>;
	prompt(): void;
}

interface InstallPrompt {
	/**
	 * A boolean signal. Its value is true when the installation prompt is
	 * available and the user has not accepted or dismissed it.
	 */
	readonly isAvailable: Signal<boolean>;

	/**
	 * Accepts the prompt. It does not automatically install the webapp,
	 * the browser will ask for confirmation.
	 */
	accept(): void;

	/**
	 * Dismisses the prompt.
	 */
	dismiss(): void;
}

interface InstallPromptState {
	readonly event: BeforeInstallPromptEvent | null;
	readonly status: BeforeInstallPromptStatus;
}

function getIsAvailable(state: InstallPromptState): boolean {
	return state.status === "default";
}

/**
 * Creates and returns an object that can be used to handle PWA
 * (progressive web application) installation events.
 * It is useful for creating an installation prompt.
 * @example
 * function InstallPrompt() {
 * 	const prompt = installPrompt();
 * 
 * 	return view(() => prompt.isAvailable() && Div(
 * 		P("Would you like to install our webapp?"),
 * 		Button("Yes", {onclick: () => prompt.accept()}),
 * 		Button("No", {onclick: () => prompt.dismiss()})
 * 	));
 * }
 * @returns An object for handling PWA installation status.
 */
export function installPrompt(): InstallPrompt {
	var win = getWindow();

	var isAppInstalledInitially = !!win && (
		(win.navigator as any).standalone ||
		(win.matchMedia && win.matchMedia("(display-mode: standalone) or (display-mode: fullscreen) or (display-mode: minimal-ui)").matches) ||
		win.document.referrer.indexOf("android-app://") > -1
	);

	var state = signal<InstallPromptState>({
		event: null,
		status: isAppInstalledInitially ? "installed" : "default"
	});

	function beforeInstall(event: Event): void {
		var e = event as BeforeInstallPromptEvent;
		e.preventDefault();
		state.set({
			event: e,
			status: "default"
		});
	}

	function setChoice(choiceResult: BeforeInstallPromptChoiceResult): void {
		state.set({
			event: null,
			status: choiceResult.outcome === "accepted" ? "installed" : "dismissed"
		});
		update();
	}

	function appInstalled(): void {
		state.set({
			event: null,
			status: "installed"
		});
	}

	if (win) {
		onDestroy(onEvent(win, "beforeinstallprompt", beforeInstall));
		onDestroy(onEvent(win, "appinstalled", appInstalled));
	}

	return {
		isAvailable: state.map(getIsAvailable),

		accept: function(): void {
			var event = state.get().event;

			if (event) {
				event.prompt();
				event.userChoice.then(setChoice);
			}
		},

		dismiss: function(): void {
			state.set({
				event: null,
				status: "dismissed"
			});
		}
	};
}
