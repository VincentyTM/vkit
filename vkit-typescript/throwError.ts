import type {Component} from "./component";

function throwError(error: any, component: Component | null){
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

export default throwError;
