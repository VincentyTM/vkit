(function($){

var routes = [];

function addRoute(route, component){
	if( typeof route !== "object" ){
		route = {
			path: route,
			component: component
		};
	}else if( component ){
		route = {
			path: route.path,
			exact: route.exact,
			params: route.params,
			matches: route.matches,
			component: component
		};
	}
	routes.push(route);
	return component;
}

$.page = addRoute;
$.routes = routes;

})($);
