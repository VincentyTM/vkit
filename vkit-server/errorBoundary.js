var noop = require("./noop");

function errorBoundary(getView, getFallbackView) {
	try {
		return getView();
	} catch (error) {
		return getFallbackView(error, noop);
	}
}

module.exports = errorBoundary;
