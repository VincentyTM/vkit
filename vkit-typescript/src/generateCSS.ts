import { isArray } from "./isArray.js";
import { toKebabCase } from "./toKebabCase.js";

interface ConditionalValue<T, K extends keyof T> {
	readonly media?: string;
	readonly on?: string;
	readonly prefixes?: string[];
	readonly value: CSSValue<T, K>;
	readonly within?: string;
}

type CSSValue<T, K extends keyof T> = T[K] | ConditionalValue<T, K>[];

export type CSSProperties = object & {
    [K in keyof Partial<CSSStyleDeclaration>]: CSSValue<CSSStyleDeclaration, K>;
} & {
	[K: string]: CSSValue<Record<string, string>, string>;
};

type MediaQueries = Record<string, Rules>;

type Rules = Record<string, Partial<CSSStyleDeclaration>>;

function setConditionalValues<K extends keyof CSSStyleDeclaration & string>(
	baseSelector: string,
	mediaQueries: MediaQueries,
	mediaQueryName: string,
	propName: K,
	conditionalValues: CSSValue<CSSStyleDeclaration, K>,
	prefixes: string[] | undefined
): void {
	if (!isArray(conditionalValues)) {
		var mediaQuery = mediaQueries[mediaQueryName] || (mediaQueries[mediaQueryName] = {});
		var rule = mediaQuery[baseSelector] || (mediaQuery[baseSelector] = {});

		if (prefixes !== undefined) {
			var n = prefixes.length;

			for (var i = 0; i < n; ++i) {
				rule[prefixes[i] + propName as K] = conditionalValues;
			}
		}
		
		rule[propName] = conditionalValues;
		return;
	}
	
	var n = conditionalValues.length;
	
	for (var i = 0; i < n; ++i) {
		var conditionalValue = conditionalValues[i];
		var mediaQueryName = conditionalValue.media || "";
		var mediaQuery = mediaQueries[mediaQueryName] || (mediaQueries[mediaQueryName] = {});
		var on = conditionalValue.on;
		var within = conditionalValue.within;
		var selector = (within ? within + " " : "") + baseSelector + (on || "");

		setConditionalValues(
			selector,
			mediaQueries,
			mediaQueryName,
			propName,
			conditionalValue.value,
			conditionalValue.prefixes
		);
	}
}

export function generateCSS(props: CSSProperties, pseudoElement: string | undefined): string {
	var baseSelector = "::this" + (pseudoElement !== undefined ? "::" + pseudoElement : "");
	var mediaQueries: MediaQueries = {};
	
	for (var propName in props) {
		var cssValue = props[propName as keyof CSSProperties & string];

		if (cssValue !== undefined) {
			setConditionalValues(
				baseSelector,
				mediaQueries,
				"",
				propName as keyof CSSStyleDeclaration & string,
				cssValue as string,
				undefined
			);
		}
	}
	
	var css: string[] = [];
	
	for (var mediaQueryName in mediaQueries) {
		if (mediaQueryName) {
			css.push("@media ", mediaQueryName, "{");
		}
		
		var mediaQuery = mediaQueries[mediaQueryName];
		
		for (var selector in mediaQuery) {
			var rule = mediaQuery[selector];
			css.push(selector, "{");
			
			for (var propName in rule) {
				var propValue = rule[propName];

				if (propValue !== undefined) {
					css.push(toKebabCase(propName), ":", propValue, ";\r\n");
				}
			}
			
			css.push("}");
		}
		
		if (mediaQueryName) {
			css.push("}");
		}
	}
	
	return css.join("");
}
