(function($) {

var assign = Object.assign || function(a, b) {
	for (var k in b) {
		a[k] = b[k];
	}
	
	return a;
};

$.objectAssign = assign;

})($);
