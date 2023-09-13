(function($){

var createState = $.state;
var onError = $.onError;
var update = $.update;

function errorBoundary(component, fallback){
	var failed = createState(false);
	var error;
	
	return failed.view(function(hasFailed){
		if( hasFailed ){
			return fallback ? fallback(error) : null;
		}
		
		onError(function(err){
			error = err;
			failed.set(true);
			update();
		});
		
		try{
			return component();
		}catch(ex){
			error = ex;
			failed.set(true);
			update();
		}
	});
}

$.errorBoundary = errorBoundary;

})($);
