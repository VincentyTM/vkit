(function($) {

var computed = $.computed;

function classNames(classes) {
	var cnames = computed(function() {
		var array = [];
		
		for (var cname in classes) {
			var val = classes[cname];
			
			if (val && typeof val.get === "function") {
				if (val.get()) {
					array.push(cname);
				}
			} else if (typeof val === "function") {
				if (val()) {
					array.push(cname);
				}
			} else if (val) {
				array.push(cname);
			}
		}
		
		return array.join(" ");
	});
	
	var update = signal.update;
	
	for(var cname in classes){
		var val = classes[cname];
		
		if( val && typeof val.subscribe === "function" ){
			val.subscribe(update);
		}
	}
	
	return signal;
}

$.classNames = classNames;

})($);
