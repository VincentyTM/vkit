(function($, undefined){

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

function matchesDefault(routePath, path, exact){
	var a = routePath.split("/");
	var b = path.split("/");
	return exact ? equals(a, b) : isPrefixOf(a, b);
}

function navigateToDefault(path){
	location.assign(path);
}

function getPathDefault(){
	return location.hash || "#";
}

$.router = function(getPath, navigateTo, matches){
	if(!getPath) getPath = getPathDefault;
	if(!matches) matches = matchesDefault;
	if(!navigateTo) navigateTo = navigateToDefault;
	
	function getCurrentRoute(routes, path){
		var n = routes.length;
		for(var i=0; i<n; ++i){
			var route = routes[i];
			if( !route.path || matches(route.path, path, route.exact || route.exact === undefined) ){
				return route;
			}
		}
		return null;
	}
	
	return {
		path: getPath,
		link: function(path, getClass, exact){
			return function(element){
				element.href = path;
				if( getClass ){
					$.prop("className", function(){
						return getClass( matches(path, getPath(), exact || exact === undefined) );
					})(element);
				}
				element.onclick = function(){
					navigateTo(path);
					$.render();
					return false;
				};
			};
		},
		isActive(path, exact){
			return matches(path, getPath(), exact || exact === undefined);
		},
		component: function(routes){
			return $.is(
				getPath,
				function(path){
					var route = getCurrentRoute(routes, path);
					if( route && route.redirectTo ){
						navigateTo(route.redirectTo);
					}
					return route ? route.component() : [];
				}
			);
		}
	};
};

})($);
