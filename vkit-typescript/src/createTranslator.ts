import { computed, Signal } from "./computed.js";

/**
 * A dictionary mapping language codes to translated words.
 * The translated word may be a string or () => string (useful for computed translations such as pluralization).
 */
export type TranslationSet<T extends string, U extends string = never> = {
	[K in T]: string | (() => string);
} & {
	[K in U]?: string | (() => string);
};

export interface TranslatorConfig<T extends string, U extends string> {
	/**
	 * @returns The current language code.
	 * It may be any string; prefer restricting it to supported language codes.
	 * Return a `Signal<T | U>` when the language can change at runtime.
	 */
	getCurrentLanguage(): T | U | Signal<T | U>;

	/**
	 * Invoked when a translation for the requested language is missing.
	 * Use it to compute a fallback display value or to log/handle missing translations.
	 * @param languageCode The requested language code lacking a translation.
	 * @param translations The available translations.
	 * @returns The fallback to display: a string or () => string (useful for computed translations such as pluralization).
	 */
	getFallbackWord(languageCode: T | U, translations: TranslationSet<T, U>): string | (() => string);
}

/**
 * Creates a type-safe, reactive translator function.
 * 
 * @template T - Required language codes. Keys in T are required in each translation set.
 * @template U - Optional language codes. Keys in U are optional in translation sets. Omit if there are no optional languages.
 * 
 * @param config Configuration object implementing `TranslatorConfig<T, U>`.
 * 
 * @example
 * // Create one translator instance per application.
 * const Translate = createTranslator<"en" | "hu", "de" | "es" | "fr">({
 * 	getCurrentLanguage() {
 * 		return inject(YourStore).langCode;
 * 	},
 * 	getFallbackWord(languageCode, existingTranslations) {
 * 		console.error("Missing translation", languageCode, existingTranslations);
 * 		return existingTranslations.en;
 * 	}
 * });
 * 
 * function YesButton() {
 * 	return Button(
 * 		Translate({
 * 			de: "Ja",
 * 			en: "Yes",
 * 			hu: "Igen"
 * 		})
 * 	);
 * }
 * @returns A translator function that maps a `TranslationSet` (or a `Signal` containing one)
 * to a `Signal` containing the translated word.
 */
export function createTranslator<T extends string, U extends string = never>(config: TranslatorConfig<T, U>) {
	var getCurrentLanguage = config.getCurrentLanguage;
	var getFallbackWord = config.getFallbackWord;

	function translate(translations: TranslationSet<T, U> | Signal<TranslationSet<T, U>>): Signal<string> {
		var languageCode = getCurrentLanguage();

		return computed<
			(
				translations: TranslationSet<T, U>,
				languageCode: T | U,
				getFallback: (languageCode: T | U, translations: TranslationSet<T, U>) => string | (() => string)
			) => string
		>(getTranslatedWord, [translations, languageCode, getFallbackWord]);
	}

	return translate;
}

function getTranslatedWord<T extends string, U extends string>(
	translations: TranslationSet<T, U>,
	languageCode: T | U,
	getFallbackWord: (languageCode: T | U, translations: TranslationSet<T, U>) => string | (() => string)
): string {
	var translation = translations[languageCode];
	var value: string | (() => string) = translation === undefined ? getFallbackWord(languageCode, translations) : translation;
	return typeof value === "function" ? value() : value;
}
