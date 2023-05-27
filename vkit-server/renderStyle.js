var scope = require("./scope.js");

function renderStyle(){
	return {
		toHTML: function(res){
			res.write(
				scope.get().getStyles()
			);
		}
	};
}

module.exports = renderStyle;
