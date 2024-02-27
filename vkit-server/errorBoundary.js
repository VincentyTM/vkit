import noop from "./noop.js";

export default function errorBoundary(getView, getFallbackView) {
	try {
		return getView();
	} catch (error) {
		return getFallbackView(error, noop);
	}
}
