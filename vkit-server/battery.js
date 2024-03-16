import computed from "./computed.js";

export default function battery() {
	return {
		charging: computed(function() {
			return true;
		}),
		
		chargingTime: computed(function() {
			return 0;
		}),
		
		dischargingTime: computed(function() {
			return Infinity;
		}),
		
		isAvailable: computed(function() {
			return false;
		}),
		
		isSupported: true,
		
		level: computed(function() {
			return 1;
		})
	};
}
