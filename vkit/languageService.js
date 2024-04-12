(function($, undefined) {

var computed = $.computed;
var inject = $.inject;
var isSignal = $.isSignal;
var objectAssign = $.objectAssign;
var signal = $.signal;
var slice = Array.prototype.slice;

function selectWordsOfLang(dictionary, code) {
	return code ? dictionary[code] : null;
}

function LanguageService() {
	if (!(this instanceof LanguageService)) {
		return inject(LanguageService);
	}
	
	var langCode = signal(null);
	var dictionary = signal({});
	var wordsOfLang = computed(selectWordsOfLang, [dictionary, langCode]);
	
	function define(update) {
		var newDict = {};
		var dict = dictionary.get();
		
		objectAssign(newDict, dict);
		
		for (var code in update) {
			var words = newDict[code] = {};
			if (dict[code]) {
				objectAssign(words, dict[code]);
			}
			objectAssign(words, update[code]);
		}
		
		dictionary.set(newDict);
		wordsOfLang.invalidate();
	}
	
	function createWord(key) {
		var args = slice.call(arguments, 1);
		var n = args.length;
		var c = computed(function(lang, key) {
			if (!lang) {
				var code = langCode.get();
				throw new Error(code ? "Language '" + code + "' does not exist" : "No language has been set");
			}
			
			var word = lang[key];
			
			if (!key) {
				return "";
			}
			
			var argCount = key.split(/%\d+/).length - 1;
			
			if (argCount !== n) {
				throw new Error("Argument count must be " + argCount + " (instead of " + n + ") in word " + key);
			}
			
			switch (typeof word) {
				case "function":
					var values = new Array(n);
					
					for (var i = 0; i < n; ++i) {
						var arg = args[i];
						values[i] = isSignal(arg) ? arg.get() : arg;
					}
					
					return word.apply(null, values);
				case "string":
					for (var i = 0; i < n; ++i) {
						var arg = args[i];
						word = word.replace(new RegExp("%" + (i + 1) + "(?!\d)"), isSignal(arg) ? arg.get() : arg);
					}
					
					if (/%\d/.test(word)) {
						throw new Error("Argument value not specified in word " + word);
					}
					
					return word;
				default:
					throw new Error("Undefined word " + key);
			}
		}, [
			wordsOfLang,
			isSignal(key) || typeof key !== "function" ? key : computed(key)
		].concat(args));
		
		c.invalidate();
		
		return c;
	}
	
	this.define = define;
	this.lang = langCode;
	this.word = createWord;
}

function define(dictionary) {
	return inject(LanguageService).define(dictionary);
}

function createWord() {
	return inject(LanguageService).word.apply(null, arguments);
}

function langCode() {
	return inject(LanguageService).lang;
}

$.define = define;
$.lang = langCode;
$.languageService = LanguageService;
$.word = createWord;

})($);
