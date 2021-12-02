(function($, undefined){

function createRouter(pathState){
	function createComponent(routes){
		routes = routes.slice();
		var n = routes.length;
		for(var i=0; i<n; ++i){
			routes[i] = new Route(routes[i]);
		}
		return pathState.view(function(path){
			var route = getCurrentRoute(routes, path);
			var params = typeof route.params === "function" ? route.params(route, path) : route.params;
			return route ? route.component.apply(null, params) : null;
		});
	}
	
	function getCurrentRoute(routes, path){
		var n = routes.length;
		for(var i=0; i<n; ++i){
			var route = routes[i];
			if( route.matches(path) ){
				return route;
			}
		}
		return null;
	}
	
	function isActive(path, exact){
		var route = typeof path === "object" ? path : new Route({path: path, exact: exact});
		return pathState.input(function(currentPath){
			return route.matches(currentPath);
		});
	}
	
	function redirectTo(path){
		return function(){
			pathState.set(path);
		};
	}
	
	return {
		path: pathState,
		isActive: isActive,
		redirectTo: redirectTo,
		component: createComponent
	};
}

function Route(route){
	this.path = route.path;
	this.exact = route.exact || route.exact === undefined;
	this.params = route.params || [];
	this.component = route.component;
	if( route.matches ) this.matches = route.matches;
}

Route.prototype.matches = function(path){
	var routePath = this.path;
	if( routePath === path || routePath === undefined ){
		return true;
	}
	if( routePath.test ){
		return routePath.test(path);
	}
	var a = routePath.split("/");
	var b = path.split("/");
	return this.exact ? equals(a, b) : isPrefixOf(a, b);
};

function equals(a, b){
	var n = a.length;
	if( n!==b.length ){
		return false;
	}
	for(var i=0; i<n; ++i){
		if( a[i]!==b[i] && a[i].charAt(0)!==":" ){
			return false;
		}
	}
	return true;
}

function isPrefixOf(a, b){
	var n = a.length;
	if( n > b.length )
		return false;
	for(var i=0; i<n; ++i){
		if( a[i]!==b[i] && a[i].charAt(0)!==":" ){
			return false;
		}
	}
	return true;
}

$.router = createRouter;

})($);
