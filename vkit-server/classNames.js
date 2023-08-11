var constant = require("./constant");

function classNames(classes){
	var array = [];
	
	for(var cname in classes){
		var val = classes[cname];
		
		if( val && typeof val.get === "function" ){
			if( val.get() ){
				array.push(cname);
			}
		}else if( typeof val === "function" ){
			if( val() ){
				array.push(cname);
			}
		}else if( val ){
			array.push(cname);
		}
	}
	
	return constant(array.join(" "));
}

module.exports = classNames;
