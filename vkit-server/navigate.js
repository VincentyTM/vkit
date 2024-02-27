import {getScope} from "./scope.js";

export default function navigate(location) {
	if (typeof location.get === "function") {
		location = location.get();
	}
	
	getScope().render = function() {
		this.res.writeHead(302, {"location": location}).end();
	};
}
