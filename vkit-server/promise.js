import noop from "./noop.js";

export default function promise() {
	return {then: noop};
};
