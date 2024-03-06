import getContext from "./context.js";
import inject from "./inject.js";
import type {View} from "./view.js";

type WindowService = {
	new(): WindowService;
	context: (getView: () => View) => any;
	data: {[key: string]: any} | null;
	window: Window & typeof globalThis;
};

export var WindowService = function(this: WindowService) {
	this.context = getContext();
	this.data = null;
	this.window = window;
} as unknown as WindowService;

export default function getWindow() {
	return inject(WindowService).window;
}
