import htmlTag from "./htmlTag.js";

export default new Proxy({}, {
	get: function(target, prop, receiver) {
		return htmlTag(prop.toLowerCase().replace(/_/g, "-"));
	}
});
