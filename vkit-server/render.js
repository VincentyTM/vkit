import append from "./append.js";
import bind from "./bind.js";
import provide from "./provide.js";
import {createScope, setScope} from "./scope.js";

export default function render(req, res, component) {
	try {
		provide(null, function() {
			var currentScope = createScope(req, res);
			setScope(currentScope);
			
			var parent = {
				appendChild: function(child) {
					child.toHTML(res);
				}
			};
			
			var view = component(currentScope);
			
			if (currentScope.render) {
				currentScope.render(view);
			} else {
				res.setHeader("content-type", "text/html; charset=utf-8");
				append(parent, view, parent, bind);
				res.end();
			}
		});
	} finally {
		setScope(null);
	}
}
