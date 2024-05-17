(function($) {

var writable = $.writable;

function arrayItemSignal(parent, item) {
    function set(value) {
		var current = item.get();
		
        if (current === value) {
            return;
        }
		
        var array = parent.get();
		
        for (var i = array.length; i--;) {
            if (array[i] === current) {
                parent.setEagerly(array.slice(0, i).concat([value], array.slice(i + 1)));
                break;
            }
        }
    }
	
    return writable(item, set);
}

$.arrayItemSignal = arrayItemSignal;

})($);
