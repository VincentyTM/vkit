const isCSSRegExp = /\.css$/i;
const isHTMLRegExp = /\.html$/i;
const isJSRegExp = /\.js$/i;
const isJSONRegExp = /\.json$/i;
const isLibJSRegExp = /\.lib\.js$/i;
const isReleaseJSRegExp = /\.release\.js$/i;
const isTemplateJSRegExp = /\.template\.js$/i;
const isTestJSRegExp = /\.test\.js$/i;
const isTXTRegExp = /\.txt$/i;

export const isCSS = (path) => isCSSRegExp.test(path);

export const isHTML = (path) => isHTMLRegExp.test(path);

export const isJS = (path) => isJSRegExp.test(path);

export const isJSON = (path) => isJSONRegExp.test(path);

export const isLibJS = (path) => isLibJSRegExp.test(path);

export const isReleaseJS = (path) => isReleaseJSRegExp.test(path);

export const isTemplateJS = (path) => isTemplateJSRegExp.test(path);

export const isTestJS = (path) => isTestJSRegExp.test(path);

export const isTextFile = (path) => isJS(path) || isCSS(path) || isHTML(path) || isJSON(path) || isTXT(path);

export const isTXT = (path) => isTXTRegExp.test(path);
