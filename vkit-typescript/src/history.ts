import { computed, ComputedSignal } from "./computed.js";
import { getWindow } from "./getWindow.js";
import { inject } from "./inject.js";
import { noop } from "./noop.js";
import { observable } from "./observable.js";
import { onDestroy } from "./onDestroy.js";
import { onEvent } from "./onEvent.js";
import { RenderConfigService } from "./RenderConfigService.js";

type HistoryState = unknown;

interface HistoryHandle {
	push(url: string, state: HistoryState): void;
	replace(url: string, state: HistoryState): void;
	state(): ComputedSignal<HistoryState>;
	url(): ComputedSignal<string>;
}

var updateHistory = observable<History>();

function getURL(win: Window & typeof globalThis): string {
	return win.location.href.replace(win.location.origin, "");
}

export function history(): HistoryHandle {
	var win = getWindow();
	return win ? historyOnClient(win) : historyOnServer();
}

function historyOnClient(win: Window & typeof globalThis): HistoryHandle {
	var history = win.history;
	
	function push(url: string, state: HistoryState): void {
		history.pushState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		updateHistory(history);
	}
	
	function replace(url: string, state: HistoryState): void {
		history.replaceState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win));
		updateHistory(history);
	}
	
	function selectState(): ComputedSignal<HistoryState> {
		var historyState = computed(function(): HistoryState {
			return history.state;
		});
		var invalidate = historyState.invalidate;
		
		onDestroy(onEvent(win, "popstate", invalidate));
		onDestroy(updateHistory.subscribe(updateLocal));
		
		function updateLocal(h: History): void {
			if (h === history) {
				invalidate();
			}
		}
		
		return historyState;
	}
	
	function selectURL(): ComputedSignal<string> {
		var historyURL = computed(getURL, [win]);
		var invalidate = historyURL.invalidate;
		
		onDestroy(onEvent(win, "popstate", invalidate));
		onDestroy(updateHistory.subscribe(updateLocal));
		
		function updateLocal(h: HistoryState): void {
			if (h === history) {
				invalidate();
			}
		}
		
		return historyURL;
	}
	
	return {
		push: push,
		replace: replace,
		state: selectState,
		url: selectURL
	};
}

function historyOnServer(): HistoryHandle {
	var renderConfig = inject(RenderConfigService);
	var request = renderConfig.request;

	function selectURLFromServer() {
		var url = request && request.url || "";
		
		return computed(function() {
			return url;
		});
	}
	
	return {
		push: noop,
		replace: noop,
		state: function() {
			return computed(function() {
				return null;
			});
		},
		url: selectURLFromServer
	};
}
