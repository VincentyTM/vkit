import { computed, Signal } from "./computed.js";

/**
 * Concatenates the strings or signals of strings provided in the parameters.
 * Numbers and bigints can also supported, they are converted to strings.
 * @example
 * const widthInPixels = signal(100);
 * const width = concat(widthInPixels, "px");
 * @param substrings Strings that will be joined.
 * @returns A signal containing the current concatenated string.
 * Updated when any of the parameters change.
 */
export function concat(...substrings: readonly (string | number | bigint | Signal<string | number | bigint>)[]): Signal<string>;

export function concat(): Signal<string> {
    return computed(getResult, arguments as ArrayLike<string | Signal<string>> as (string | Signal<string>)[]);
}

function getResult(...substrings: string[]): string;

function getResult(): string {
    return Array.prototype.join.call(arguments, "");
}
