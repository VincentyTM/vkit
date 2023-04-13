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

function getNth(i){
	return function(array){
		return array[i];
	};
}

function split(path){
	return path.split("/");
}

function parsePath(route, pathState){
	var splitPath = pathState.map(split);
	var keys = {};
	var parts = route.path.split("/");
	var n = parts.length;
	for(var i=0; i<n; ++i){
		var part = parts[i];
		if( part.charAt(0) === ":" ){
			keys[part.substring(1)] = splitPath.map(getNth(i));
		}
	}
	return keys;
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

function createRouter(pathState, routes){
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
			var params = typeof route.path === "string" && route.path.indexOf(":") !== -1 ? parsePath(route, pathState) : null;
			return component ? component(params) : null;
		});
	}
	
	var currentRoute = pathState.map(getRoute);
	
	return {
		path: pathState,
		isActive: isActive,
		getRoute: getRoute,
		currentRoute: currentRoute,
		render: render
	};
}

$.router = createRouter;

})($);
