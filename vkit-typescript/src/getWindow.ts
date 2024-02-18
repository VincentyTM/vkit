import getContext from "./context";
import inject from "./inject";
import {View} from "./view";

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
