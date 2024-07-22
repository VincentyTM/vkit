import computed from "./computed.js";

export default function assetState(refs, assetName, defaultValue) {
	return computed(function() {
		var name = typeof assetName === "function" ? assetName() : assetName;
		
		if (!name && name !== "") {
			return defaultValue;
		}
		
		var asset = refs.add(name);
		return asset.isFulfilled() ? asset.get() : defaultValue;
	});
}
