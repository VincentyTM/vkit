var scope = require("./scope.js");

function setMeta(name, content){
	scope.get().addWindowData("meta:" + name, content);
}

module.exports = setMeta;
