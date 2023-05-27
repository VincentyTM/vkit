var scope = require("./scope.js");

function navigate(location){
	if( typeof location.get === "function" ){
		location = location.get();
	}
	
	scope.get().render = function(){
		this.res.writeHead(302, {"location": location}).end();
	};
}

module.exports = navigate;
