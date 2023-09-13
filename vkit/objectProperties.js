(function($) {

var objectProperty = $.objectProperty;

function objectProperties(object) {
	return new Proxy(object, {
		get: function(object, property, receiver) {
			return objectProperty(object, property);
		}
	});
}

$.objectProperties = objectProperties;

})($);
