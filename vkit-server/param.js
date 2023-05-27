var queryParamsState = require("./queryParamsState.js");

function param(name){
	return queryParamsState()(name);
}

module.exports = param;
