const replacer = string => "<\\" + string.substring(1);

module.exports = string => string.replace(/<\/style\b/ig, replacer);
