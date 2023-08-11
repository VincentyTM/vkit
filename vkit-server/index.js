var languageService = require("./languageService");
var noop = require("./noop");

module.exports = {
	attributes: require("./attributes"),
	await: require("./await"),
	computed: require("./signal").computed,
	classes: require("./classes"),
	classNames: require("./classNames"),
	define: languageService.define,
	effect: noop,
	escapeHTML: require("./escapeHTML"),
	history: require("./history"),
	href: require("./href"),
	html: require("./html"),
	htmlString: require("./htmlString"),
	htmlTag: require("./htmlTag"),
	htmlTags: require("./htmlTags"),
	inject: require("./inject").inject,
	http: require("./http"),
	ifElse: require("./ifElse"),
	lang: languageService.lang,
	languageService: languageService.languageService,
	lazy: require("./lazy"),
	navigate: require("./navigate"),
	noop,
	observable: require("./observable"),
	param: require("./param"),
	params: require("./params"),
	path: require("./path"),
	provide: require("./inject").provide,
	queryParams: require("./queryParams"),
	queryParamsState: require("./queryParamsState"),
	router: require("./router"),
	server: require("./server"),
	signal: require("./signal").writable,
	state: require("./signal").writable,
	style: require("./style"),
	styledHtmlTag: require("./styledHtmlTag"),
	theme: require("./theme"),
	title: require("./title"),
	toArray: require("./toArray"),
	window: require("./window"),
	word: languageService.word
};
