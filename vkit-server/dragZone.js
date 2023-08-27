var noop = require("./noop");

function dragZone(zoneTarget){
	function draggable(target, after){
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

module.exports = dragZone;
