import { Signal } from "./computed.js";
import { CustomTemplate } from "./Template.js";

type Writable<T> = {
    [K in keyof T]-?: T[K] extends Readonly<T[K]> ? never : K;
}[keyof T];

type WritableCSSStyleDeclaration = Writable<CSSStyleDeclaration>;

export type InlineStyleInput = {
    [K in WritableCSSStyleDeclaration]?: (
		| WritableCSSStyleDeclaration[K]
		| Signal<WritableCSSStyleDeclaration[K]>
		| (() => WritableCSSStyleDeclaration[K])
	);
};

export interface InlineStyleTemplateInternals {
	styleProperties: InlineStyleInput;
}

export type InlineStyleTemplate = InlineStyleTemplateInternals & CustomTemplate<ElementCSSInlineStyle>;
