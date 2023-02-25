(function($, undefined){

function equals(a, b){
	var n = a.length;
	if( n !== b.length ){
		return false;
	}
	for(var i=0; i<n; ++i){
		if( a[i] !== b[i] && a[i].charAt(0) !== ":" ){
			return false;
		}
	}
	return true;
}

function isPrefixOf(a, b){
	var n = a.length;
	if( n > b.length ){
		return false;
	}
	for(var i=0; i<n; ++i){
		if( a[i] !== b[i] && a[i].charAt(0) !== ":" ){
			return false;
		}
	}
	return true;
}

function matches(routePath, currentPath, exact){
	if( routePath === currentPath || routePath === undefined ){
		return true;
	}
	if( typeof routePath.test === "function" ){
		return routePath.test(currentPath);
	}
	if( typeof routePath === "function" ){
		return routePath(currentPath);
	}
	var a = routePath.split("/");
	var b = currentPath.split("/");
	return exact !== false ? equals(a, b) : isPrefixOf(a, b);
}

function Router(pathState, routes){
	if(!(this instanceof Router)){
		return new Router(pathState, routes);
	}
	
	function getRoute(path){
		var n = routes.length;
		for(var i=0; i<n; ++i){
			var route = routes[i];
			if( route && matches(route.path, path, route.exact) ){
				return route;
			}
		}
		return null;
	}
	
	function isActive(path){
		var route = getRoute(path);
		return currentRoute.map(function(r){
			return r === route;
		});
	}
	
	function render(){
		return currentRoute.view(function(route){
			var component = route.component;
			var params = route.params;
			return component ? (params ? component.apply(null, params) : component()) : null;
		});
	}
	
	var currentRoute = pathState.map(getRoute);
	
	this.path = pathState;
	this.isActive = isActive;
	this.getRoute = getRoute;
	this.currentRoute = currentRoute;
	this.render = render;
}

$.router = Router;

})($);
