var isSignal = require("./isSignal");

function getValue(object, property){
	var value = object[property];
	return isSignal(value) ? value() : value;
}

var handler = {
	get: getValue
};

function of(object){
	return new Proxy(object, handler);
}

module.exports = of;
