import computed, {ComputedSignal} from "./computed";
import getWindow from "./window";
import observable from "./observable";
import onEvent from "./onEvent";
import onUnmount from "./onUnmount";

type HistoryState = unknown;

type HistoryHandle = {
	push(url: string, state: HistoryState): void;
	replace(url: string, state: HistoryState): void;
	state(): ComputedSignal<HistoryState>;
	url(): ComputedSignal<string>;
};

var updateHistory = observable<History>();

function getURL(win: Window & typeof globalThis): string {
	return win.location.href.replace(win.location.origin, "");
}

function createHistoryHandler(win?: Window & typeof globalThis): HistoryHandle {
	if (!win) {
		win = getWindow();
	}
	
	var history = win.history;
	
	function push(url: string, state: HistoryState): void {
		history.pushState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win!));
		updateHistory(history);
	}
	
	function replace(url: string, state: HistoryState): void {
		history.replaceState(state === undefined ? null : state, "", typeof url === "string" ? url : getURL(win!));
		updateHistory(history);
	}
	
	function selectState(): ComputedSignal<HistoryState> {
		var historyState = computed(function(): HistoryState {
			return history.state;
		});
		var invalidate = historyState.invalidate;
		
		onUnmount(onEvent(win!, "popstate", invalidate));
		onUnmount(updateHistory.subscribe(updateLocal));
		
		function updateLocal(h: History): void {
			if (h === history) {
				invalidate();
			}
		}
		
		return historyState;
	}
	
	function selectURL(): ComputedSignal<string> {
		var historyURL = computed(function(): string {
			return getURL(win!);
		});
		var invalidate = historyURL.invalidate;
		
		onUnmount(onEvent(win!, "popstate", invalidate));
		onUnmount(updateHistory.subscribe(updateLocal));
		
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

export default createHistoryHandler;
