var computed = require("./signal").computed;

function getSelf(value) {
	return value;
}

function readOnly(signalOrValue) {
	return computed(getSelf, [signalOrValue]);
}

module.exports = readOnly;
