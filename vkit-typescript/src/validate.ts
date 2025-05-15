interface SchemaBase {
	optional?: boolean;
	type: string;
}

interface UnknownSchema extends SchemaBase {
	type: "unknown";
}

interface ArraySchema<U> extends SchemaBase {
	items: Schema<U>;
	maxCount?: number;
	minCount?: number;
	type: "array";
}

interface BooleanSchema extends SchemaBase {
	type: "boolean";
}

interface NullSchema extends SchemaBase {
	type: "null";
}

interface NumberSchema extends SchemaBase {
	max?: number;
	min?: number;
	step?: number;
	type: "number";
}

interface StringSchema extends SchemaBase {
	maxLength?: number;
	minLength?: number;
	options?: string[];
	pattern?: RegExp;
	type: "string";
}

interface EnumSchema<T> extends SchemaBase {
	options: UnionToTuple<T>;
	type: "enum";
}

interface ObjectSchema<T> extends SchemaBase {
	keyOptions?: ObjectSchemaKeyOptions;
	properties: ObjectSchemaProperties<T>;
	type: "object";
	values?: Schema<T[keyof T]>;
}

type ObjectSchemaProperties<T> = {
	[K in keyof T]-?: Schema<Exclude<T[K], undefined>>;
};

interface ObjectSchemaKeyOptions {
	maxCount: number;
	maxLength?: number;
	minCount?: number;
	minLength?: number;
	pattern?: RegExp;
}

type UnionToIntersection<U> = (
	U extends any ? (arg: U) => any : never
) extends (arg: infer I) => void
	? I
	: never;

type UnionToTuple<T> = UnionToIntersection<(T extends any ? (t: T) => T : never)> extends (_: any) => infer W
	? [...UnionToTuple<Exclude<T, W>>, W]
	: [];

export type Schema<T> = EnumSchema<T> | UnknownSchema | (
	T extends string ? StringSchema :
	T extends number ? NumberSchema :
	T extends boolean ? BooleanSchema :
	T extends null ? NullSchema :
	T extends (infer U)[] ? ArraySchema<U> :
	T extends object ? ObjectSchema<T> :
	never
);

interface ValidationErrorBase {
	readonly value: unknown;
}

export type ValidationError = (
	| ArrayValidationError
	| ArrayItemValidationError
	| ArrayMaxCountValidationError
	| ArrayMinCountValidationError
	| BooleanValidationError
	| EnumValidationError
	| NullValidationError
	| NumberValidationError
	| NumberMaxValidationError
	| NumberMinValidationError
	| NumberStepValidationError
	| ObjectValidationError
	| ObjectCustomPropertyMaxCountValidationError
	| ObjectCustomPropertyMinCountValidationError
	| ObjectMissingPropertyValidationError
	| ObjectUnnecessaryPropertyValidationError
	| ObjectKeyMaxLengthValidationError
	| ObjectKeyMinLengthValidationError
	| ObjectKeyPatternValidationError
	| ObjectPropertyValidationError
	| StringValidationError
	| StringMaxLengthValidationError
	| StringMinLengthValidationError
	| StringPatternValidationError
	| UnknownValidationError
);

interface ArrayValidationError extends ValidationErrorBase {
	readonly type: "array";
}

interface ArrayItemValidationError extends ValidationErrorBase {
	readonly index: number;
	readonly itemError: ValidationError;
	readonly itemValue: unknown;
	readonly type: "arrayItem";
}

interface ArrayMaxCountValidationError extends ValidationErrorBase {
	readonly count: number;
	readonly maxCount: number | undefined;
	readonly type: "arrayMaxCount";
}

interface ArrayMinCountValidationError extends ValidationErrorBase {
	readonly count: number;
	readonly minCount: number | undefined;
	readonly type: "arrayMinCount";
}

interface BooleanValidationError extends ValidationErrorBase {
	readonly type: "boolean";
}

interface EnumValidationError extends ValidationErrorBase {
	readonly options: readonly unknown[];
	readonly type: "enum";
}

interface NullValidationError extends ValidationErrorBase {
	readonly type: "null";
}

interface NumberValidationError extends ValidationErrorBase {
	readonly type: "number";
}

interface NumberMaxValidationError extends ValidationErrorBase {
	readonly max: number | undefined;
	readonly type: "numberMax";
}

interface NumberMinValidationError extends ValidationErrorBase {
	readonly min: number | undefined;
	readonly type: "numberMin";
}

interface NumberStepValidationError extends ValidationErrorBase {
	readonly step: number | undefined;
	readonly type: "numberStep";
}

interface ObjectValidationError extends ValidationErrorBase {
	readonly type: "object";
}

interface ObjectCustomPropertyMaxCountValidationError extends ValidationErrorBase {
	readonly count: number;
	readonly key: string;
	readonly maxCount: number | undefined;
	readonly type: "objectCustomPropertyMaxCount";
}

interface ObjectCustomPropertyMinCountValidationError extends ValidationErrorBase {
	readonly count: number;
	readonly minCount: number | undefined;
	readonly type: "objectCustomPropertyMinCount";
}

interface ObjectMissingPropertyValidationError extends ValidationErrorBase {
	readonly key: string;
	readonly type: "objectMissingProperty";
}

interface ObjectUnnecessaryPropertyValidationError extends ValidationErrorBase {
	readonly key: string;
	readonly type: "objectUnnecessaryProperty";
}

interface ObjectKeyMaxLengthValidationError extends ValidationErrorBase {
	readonly key: string;
	readonly maxLength: number | undefined;
	readonly type: "objectKeyMaxLength";
}

interface ObjectKeyMinLengthValidationError extends ValidationErrorBase {
	readonly key: string;
	readonly minLength: number | undefined;
	readonly type: "objectKeyMinLength";
}

interface ObjectKeyPatternValidationError extends ValidationErrorBase {
	readonly key: string;
	readonly pattern: RegExp | undefined;
	readonly type: "objectKeyPattern";
}

interface ObjectPropertyValidationError extends ValidationErrorBase {
	readonly key: string;
	readonly propertyError: ValidationError;
	readonly propertyValue: unknown;
	readonly type: "objectProperty";
}

interface StringValidationError extends ValidationErrorBase {
	readonly type: "string";
}

interface StringMaxLengthValidationError extends ValidationErrorBase {
	readonly maxLength: number | undefined;
	readonly type: "stringMaxLength";
}

interface StringMinLengthValidationError extends ValidationErrorBase {
	readonly minLength: number | undefined;
	readonly type: "stringMinLength";
}

interface StringPatternValidationError extends ValidationErrorBase {
	readonly pattern: RegExp | undefined;
	readonly type: "stringPattern";
}

interface UnknownValidationError extends ValidationErrorBase {
	readonly type: "unknown";
}

export function isValid<T>(value: any, schema: Schema<T>): value is T {
	return validate(value, schema) === null;
}

export function validate<T>(value: any, schema: Schema<T>): ValidationError | null {
	if (schema.type === "enum") {
		if (schema.options) {
			var m = schema.options.length;

			for (var i = 0; i < m; ++i) {
				if (schema.options[i] === value) {
					return null;
				}
			}
		}

		return {
			options: schema.options,
			type: "enum",
			value: value
		};
	}

	if (schema.type === "string") {
		if (typeof value !== "string") {
			return {
				type: "string",
				value: value
			};
		}

		if ("maxLength" in schema && (typeof schema.maxLength !== "number" || isNaN(schema.maxLength) || schema.maxLength < value.length)) {
			return {
				maxLength: schema.maxLength,
				type: "stringMaxLength",
				value: value
			};
		}

		if ("minLength" in schema && (typeof schema.minLength !== "number" || isNaN(schema.minLength) || value.length < schema.minLength)) {
			return {
				minLength: schema.minLength,
				type: "stringMinLength",
				value: value
			};
		}

		if ("pattern" in schema && (!schema.pattern || !schema.pattern.test(value))) {
			return {
				pattern: schema.pattern,
				type: "stringPattern",
				value: value
			};
		}

		return null;
	}
	
	if (schema.type === "number") {
		if (typeof value !== "number") {
			return {
				type: "number",
				value: value
			};
		}

		if ("max" in schema && (typeof schema.max !== "number" || isNaN(schema.max) || schema.max < value)) {
			return {
				max: schema.max,
				type: "numberMax",
				value: value
			};
		}

		if ("min" in schema && (typeof schema.min !== "number" || isNaN(schema.min) || value < schema.min)) {
			return {
				min: schema.min,
				type: "numberMin",
				value: value
			};
		}

		if ("step" in schema && (typeof schema.step !== "number" || isNaN(schema.step) || value !== Math.floor(value / schema.step) * schema.step)) {
			return {
				type: "numberStep",
				step: schema.step,
				value: value
			};
		}

		return null;
	}
	
	if (schema.type === "boolean") {
		if (typeof value !== "boolean") {
			return {
				type: "boolean",
				value: value
			};
		}

		return null;
	}
	
	if (schema.type === "null") {
		if (value !== null) {
			return {
				type: "null",
				value: value
			};
		}
		
		return null;
	}

	if (schema.type === "object") {
		if (Object.prototype.toString.call(value) !== "[object Object]") {
			return {
				type: "object",
				value: value
			};
		}

		var properties = schema.properties;
		var maxCustomPropertyCount = schema.keyOptions ? schema.keyOptions.maxCount : 0;
		var customPropertyCount = 0;

		if ("keyOptions" in schema) {
			const keyOptions = schema.keyOptions;

			if (keyOptions === undefined) {
				return {
					count: customPropertyCount,
					minCount: undefined,
					type: "objectCustomPropertyMinCount",
					value: value
				};
			}

			for (var key in value) {
				if (!(key in properties)) {
					if ("maxLength" in keyOptions && (typeof keyOptions.maxLength !== "number" || isNaN(keyOptions.maxLength) || keyOptions.maxLength < value.length)) {
						return {
							key: key,
							maxLength: keyOptions.maxLength,
							type: "objectKeyMaxLength",
							value: value
						};
					}

					if ("minLength" in keyOptions && (typeof keyOptions.minLength !== "number" || isNaN(keyOptions.minLength) || keyOptions.minLength > value.length)) {
						return {
							key: key,
							minLength: keyOptions.minLength,
							type: "objectKeyMinLength",
							value: value
						};
					}

					if ("pattern" in keyOptions && (!keyOptions.pattern || !keyOptions.pattern.test(key))) {
						return {
							key: key,
							pattern: keyOptions.pattern,
							type: "objectKeyPattern",
							value: value
						};
					}
				}

				++customPropertyCount;

				if (customPropertyCount > maxCustomPropertyCount) {
					return {
						count: customPropertyCount,
						key: key,
						maxCount: maxCustomPropertyCount,
						type: "objectCustomPropertyMaxCount",
						value: value
					};
				}

				if ("values" in schema) {
					if (schema.values === undefined) {
						return {
							key: key,
							propertyError: {
								type: "unknown",
								value: value[key]
							},
							propertyValue: value[key],
							type: "objectProperty",
							value: value
						};
					}

					var propertyError = validate(value[key], schema.values);

					if (propertyError !== null) {
						return {
							key: key,
							propertyError: propertyError,
							propertyValue: value[key],
							type: "objectProperty",
							value: value
						};
					}
				}
			}

			if (keyOptions.minCount !== undefined && customPropertyCount < keyOptions.minCount) {
				return {
					count: customPropertyCount,
					minCount: keyOptions.minCount,
					type: "objectCustomPropertyMinCount",
					value: value
				};
			}
		} else {
			for (var key in value) {
				if (!(key in properties)) {
					return {
						key: key,
						type: "objectUnnecessaryProperty",
						value: value
					};
				}
			}
		}

		for (var keyFromSchema in properties) {
			if (keyFromSchema in value) {
				var propertyError = validate(value[keyFromSchema], properties[keyFromSchema]);

				if (propertyError !== null) {
					return {
						key: keyFromSchema,
						propertyError: propertyError,
						propertyValue: value[keyFromSchema],
						type: "objectProperty",
						value: value
					};
				}
			} else {
				if (!properties[keyFromSchema].optional) {
					return {
						key: keyFromSchema,
						type: "objectMissingProperty",
						value: value
					};
				}
			}
		}

		return null;
	}

	if (schema.type === "array") {
		if (Object.prototype.toString.call(value) !== "[object Array]") {
			return {
				type: "array",
				value: value
			};
		}

		var itemType = schema.items;
		var n = value.length;

		if ("maxCount" in schema && (typeof schema.maxCount !== "number" || isNaN(schema.maxCount) || schema.maxCount < n)) {
			return {
				count: n,
				maxCount: schema.maxCount,
				type: "arrayMaxCount",
				value: value
			};
		}

		if ("minCount" in schema && (typeof schema.minCount !== "number" || isNaN(schema.minCount) || n < schema.minCount)) {
			return {
				count: n,
				minCount: schema.minCount,
				type: "arrayMinCount",
				value: value
			};
		}

		for (var i = 0; i < n; ++i) {
			var error = validate(value[i], itemType);

			if (error !== null) {
				return {
					index: i,
					itemError: error,
					itemValue: value[i],
					type: "arrayItem",
					value: value
				};
			}
		}

		return null;
	}

	if (schema.type === "unknown") {
		return null;
	}

	return {
		type: "unknown",
		value: value
	};
}
