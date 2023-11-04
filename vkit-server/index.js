var htmlTag = require("./htmlTag");
var htmlTags = require("./htmlTags");
var languageService = require("./languageService");
var noop = require("./noop");
var signal = require("./signal");
var styledHtmlTag = require("./styledHtmlTag");

module.exports = {
	array: require("./array"),
	assets: require("./assets"),
	attributes: require("./attributes"),
	await: require("./await"),
	classes: require("./classes"),
	classNames: require("./classNames"),
	computed: require("./computed"),
	concat: require("./concat"),
	customElement: require("./customElement"),
	define: languageService.define,
	dialogs: require("./dialogs"),
	dragZone: require("./dragZone"),
	effect: noop,
	errorBoundary: require("./errorBoundary"),
	escapeHTML: require("./escapeHTML"),
	get: require("./get"),
	history: require("./history"),
	href: require("./href"),
	html: require("./html"),
	htmlTag: htmlTag,
	htmlTags: htmlTags,
	http: require("./http"),
	ifElse: require("./ifElse"),
	inject: require("./inject"),
	interval: noop,
	isArray: require("./isArray"),
	isSignal: require("./isSignal"),
	lang: languageService.lang,
	languageService: languageService.languageService,
	lazy: require("./lazy"),
	map: require("./map"),
	mediaQuery: require("./mediaQuery"),
	meta: require("./meta"),
	navigate: require("./navigate"),
	noop: noop,
	observable: require("./observable"),
	of: require("./of"),
	param: require("./param"),
	params: require("./params"),
	path: require("./path"),
	preferredLanguages: require("./preferredLanguages"),
	preload: require("./preload"),
	provide: require("./provide"),
	queryParams: require("./queryParams"),
	queryParamsState: require("./queryParamsState"),
	router: require("./router"),
	server: require("./server"),
	shuffle: require("./shuffle"),
	signal: signal,
	state: signal,
	string: require("./string"),
	style: require("./style"),
	styledHtmlTag: styledHtmlTag,
	svgTag: htmlTag,
	svgTags: htmlTags,
	text: require("./text"),
	theme: require("./theme"),
	title: require("./title"),
	toArray: require("./toArray"),
	virtualHtmlTag: htmlTag,
	virtualHtmlTags: htmlTags,
	virtualStyledHtmlTag: styledHtmlTag,
	window: require("./window"),
	windowContent: require("./windowContent"),
	word: languageService.word
};
