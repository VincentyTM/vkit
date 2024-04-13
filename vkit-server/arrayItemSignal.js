import writable from "./writable.js";

export default function arrayItemSignal(parent, item) {
    var current = item.get();
	
    function set(value) {
        if (current === value) {
            return;
        }
		
        var array = parent.get();
		
        for (var i = array.length; i--;) {
            if (array[i] === current) {
                parent.set(array.slice(0, i).concat([value], array.slice(i + 1)));
                break;
            }
        }
		
        current = value;
    }
	
    return writable(item, set);
}
