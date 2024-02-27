import map from "./map.js";

function concat() {
	return Array.prototype.join.call(arguments, "");
}

export default map(concat);
