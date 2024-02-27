import computed from "./computed.js";

export default function persistentStorage() {
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
