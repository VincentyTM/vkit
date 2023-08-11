var computed = require("./signal").computed;
var createSignal = require("./signal").writable;
var inject = require("./inject").inject;
var slice = Array.prototype.slice;

var assign = Object.assign || function(a, b){
	for(var k in b){
		a[k] = b[k];
	}
};

function selectWordsOfLang(dictionary, code){
	return code ? dictionary[code] : null;
}

function LanguageService(){
	if(!(this instanceof LanguageService)){
		return inject(LanguageService);
	}
	
	var langCode = createSignal(null);
	var dictionary = createSignal({});
	var wordsOfLang = computed(selectWordsOfLang, [dictionary, langCode]);
	
	function define(update){
		var newDict = {};
		var dict = dictionary.get();
		
		assign(newDict, dict);
		
		for(var code in update){
			var words = newDict[code] = {};
			if( dict[code] ){
				assign(words, dict[code]);
			}
			assign(words, update[code]);
		}
		
		dictionary.set(newDict);
		wordsOfLang.update();
	}
	
	function createWord(key){
		var keyState = key && typeof key.get === "function" ? key : {get: function(){ return key; }};
		var args = arguments;
		var n = args.length;
		var states = [wordsOfLang, keyState];
		
		for(var i=1; i<n; ++i){
			if( args[i] === undefined ){
				throw new Error("Argument %" + i + " missing from word " + key);
			}
			if( args[i].get ){
				states.push(args[i]);
			}
		}
		
		return computed(function(lang, key){
			if(!lang){
				var code = langCode.get();
				throw new Error(code ? "Language '" + code + "' does not exist" : "No language has been set");
			}
			var word = lang[key];
			if(!key){
				return "";
			}
			switch(typeof word){
				case "function":
					var values = slice.call(args, 1);
					var m = n - 1;
					for(var i=0; i<m; ++i){
						var value = values[i];
						if( value && value.get ){
							values[i] = value.get();
						}
					}
					return word.apply(null, values);
				case "string":
					for(var i=1; i<n; ++i){
						var arg = args[i];
						word = word.replace("%" + i, arg && arg.get ? arg.get() : arg);
					}
					return word;
				default:
					throw new Error("Undefined word " + key);
			}
		}, states);
	}
	
	this.define = define;
	this.lang = langCode;
	this.word = createWord;
}

function define(dictionary){
	return inject(LanguageService).define(dictionary);
}

function createWord(){
	return inject(LanguageService).word.apply(null, arguments);
}

function langCode(){
	return inject(LanguageService).lang;
}

module.exports = {
	define: define,
	lang: langCode,
	languageService: LanguageService,
	word: createWord
};
