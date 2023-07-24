var append = require("./append.js");
var bind = require("./bind.js");
var provide = require("./inject.js").provide;
var scope = require("./scope.js");

function render(req, res, component){
	try{
		provide(null, function(){
			var currentScope = scope.create(req, res);
			scope.set(currentScope);
			var parent = {
				appendChild: function(child){
					child.toHTML(res);
				}
			};
			var view = component(currentScope);
			if( currentScope.render ){
				currentScope.render(view);
			}else{
				res.setHeader("content-type", "text/html; charset=utf-8");
				append(parent, view, parent, bind);
				res.end();
			}
		});
	}finally{
		scope.set(null);
	}
}

module.exports = render;
