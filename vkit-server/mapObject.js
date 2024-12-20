import computed from "./computed.js";

export default function mapObject(objectSignal, mapKey, data) {
	var values = {};
	
	for (var key in typeof objectSignal === "function" ? objectSignal() : objectSignal) {
		values[key] = mapKey(key, objectSignal, data);
	}
	
	return computed(function() {
		return values;
	});
}
