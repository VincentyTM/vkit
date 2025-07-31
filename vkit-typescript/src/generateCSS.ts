import { isArray } from "./isArray.js";
import { toKebabCase } from "./toKebabCase.js";

interface ConditionalValue<K extends keyof CSSStyleDeclaration> {
	readonly media?: string;
	readonly on?: string;
	readonly value: CSSValue<K>;
}

type CSSValue<K extends keyof CSSStyleDeclaration> = CSSStyleDeclaration[K] | ConditionalValue<K>[];

export type CSSProperties = object & {
	[K in keyof Partial<CSSStyleDeclaration>]: CSSValue<K>;
};

type MediaQueries = Record<string, Rules>;

type Rules = Record<string, Partial<CSSStyleDeclaration>>;

function setConditionalValues<K extends keyof CSSStyleDeclaration & string>(
	baseSelector: string,
	mediaQueries: MediaQueries,
	mediaQueryName: string,
	propName: K,
	conditionalValues: CSSValue<K>
): void {
	if (!isArray(conditionalValues)) {
		var mediaQuery = mediaQueries[mediaQueryName] || (mediaQueries[mediaQueryName] = {});
		var rule = mediaQuery[baseSelector] || (mediaQuery[baseSelector] = {});
		rule[propName] = conditionalValues;
		return;
	}
	
	var n = conditionalValues.length;
	
	for (var i = 0; i < n; ++i) {
		var conditionalValue = conditionalValues[i];
		var mediaQueryName = conditionalValue.media || "";
		var mediaQuery = mediaQueries[mediaQueryName] || (mediaQueries[mediaQueryName] = {});
		var on = conditionalValue.on;
		var selector = on ? baseSelector + on : baseSelector;

		setConditionalValues(
			selector,
			mediaQueries,
			mediaQueryName,
			propName,
			conditionalValue.value
		);
	}
}

export function generateCSS(props: CSSProperties): string {
	var baseSelector = "::this";
	var mediaQueries: MediaQueries = {};
	
	for (var propName in props) {
		var cssValue = props[propName as keyof CSSProperties & string];

		if (cssValue !== undefined) {
			setConditionalValues(
				baseSelector,
				mediaQueries,
				"",
				propName as keyof CSSStyleDeclaration & string,
				cssValue
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
