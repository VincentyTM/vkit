var computed = require("./computed");

function persistentStorage() {
	return {
		permission: computed(function() {
			return {
				state: "default"
			};
		}),
		
		persisted: computed(function() {
			return false;
		})
	};
}

module.exports = persistentStorage;
