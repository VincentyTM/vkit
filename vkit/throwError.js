(function($){

function throwError(error, component){
	while( component ){
		if( component.emitError ){
			try{
				component.emitError(error);
				return;
			}catch(ex){
				error = ex;
			}
		}
		
		component = component.parent;
	}
	
	throw error;
}

$.throwError = throwError;

})($);
