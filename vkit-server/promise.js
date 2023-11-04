var noop = require("./noop");

module.exports = function() {
	return {then: noop};
};
