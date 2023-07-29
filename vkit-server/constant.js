var createComputedSignal = require("./signal").computed;

function createConstantSignal(value){
	return createComputedSignal(function(){
		return value;
	});
}

module.exports = createConstantSignal;
