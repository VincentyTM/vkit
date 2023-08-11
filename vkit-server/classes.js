var classNames = require("./classNames");

function classes(c){
	return {
		className: classNames(c)
	};
}

module.exports = classes;
