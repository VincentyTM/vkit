const replacer = string => "<\\" + string.substring(1);

module.exports = string => string.replace(/<\/script\b/ig, replacer);
