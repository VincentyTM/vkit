(function($){

var htmlTag = $.htmlTag;
var style = $.style;

$.styled = new Proxy({}, {
	get: function(target, prop, receiver){
		var tag = htmlTag(prop.toLowerCase().replace(/_/g, "-"));
		
		return function(strings){
			var n = strings.length;
			var a = [];
			
			if( n > 0 && strings[0].replace(/\s+/g, "").length > 0 ){
				a.push("::this{", strings[0], "}");
			}
			
			var atRules = [];
			
			for(var i=1; i<n; ++i){
				var arg = arguments[i];
				var rules = strings[i];
				var isArgAtRule = typeof arg === "string" && arg.charAt(0) === "@";
				
				if( isArgAtRule ){
					atRules.push(arg);
				}
				
				if( rules.replace(/\s+/g, "").length > 0 ){
					var m = atRules.length;
					
					for(var j=0; j<m; ++j){
						a.push(atRules[j], "{");
					}
					
					if( m > 0 ){
						atRules.splice(0, m);
					}
					
					if( isArgAtRule ){
						a.push("::this{", rules, "}");
					}else{
						a.push("::this", arg, "{", rules, "}");
					}
					
					for(var j=0; j<m; ++j){
						a.push("}");
					}
				}
			}
			
			var s = style(a.join(""));
			
			return function(){
				return tag(s, arguments);
			};
		};
	}
});

})($);
