import noop from "./noop.js";

export default function dragZone(zoneTarget) {
	function draggable(target, after) {
		return {
			style: {
				touchAction: "none"
			}
		};
	}
	
	return {
		bind: noop,
		draggable: draggable
	};
}
