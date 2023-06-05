const isCSS = require("./isCSS");
const isJS = require("./isJS");
const isJSON = require("./isJSON");
const isHTML = require("./isHTML");
const isTXT = require("./isTXT");

module.exports = path => isJS(path) || isCSS(path) || isHTML(path) || isJSON(path) || isTXT(path);
