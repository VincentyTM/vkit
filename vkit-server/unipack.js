import computed from "./computed.js";
import thenable from "./thenable.js";

function pack(files) {
	throw new Error("The pack method cannot be called on the server");
}

function unpack() {
	return thenable(
		computed(function() {
			return {};
		})
	);
}

export default {
	pack: pack,
	unpack: unpack
};
