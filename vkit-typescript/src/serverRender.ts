import { Bindings } from "./bind.js";
import { Template } from "./Template.js";
import { appendChild, setProperty, ServerElement } from "./createServerElement.js";
import { isSignal } from "./isSignal.js";
import { toKebabCase } from "./toKebabCase.js";

export function serverRender<P extends ParentNode>(container: ServerElement, template: Template<P>): void {
	if (template === null || template === undefined || template === true || template === false) {
		return;
	}
	
	if (typeof template === "string" || typeof template === "number" || typeof template === "bigint") {
        appendChild(container, String(template));
		return;
	}
	
	if (isSignal(template)) {
		appendChild(container, String(template.get()));
		return;
	}
	
	if (typeof template === "function") {
		appendChild(container, String(template()));
		return;
	}
	
	if ("length" in template) {
		var n = template.length;
		
		for (var i = 0; i < n; ++i) {
			serverRender(container, template[i]);
		}
		
		return;
	}
	
    if ("next" in template) {
        var x: IteratorResult<Template<P>, Template<P>>;

        do {
            x = template.next();
            serverRender(container, x.value);
        } while (!x.done);

        return;
    }

    if ("serverRender" in template) {
		template.serverRender(container, template);
		return;
    }

	bindTemplate(container, template as Exclude<Bindings<P>, Node>);
}

function bindTemplate<P>(container: ServerElement, template: Bindings<P>): void {
	for (var key in template) {
		var value = template[key];

		if (value === undefined || value === null) {
			continue;
		}

		if (key === "style") {
			var style = container.styleProps;

			for (var cssKey in value) {
				var cssValue = value[cssKey];
				var cssEvaluatedValue = typeof cssValue === "function" ? (cssValue as () => CSSStyleDeclaration[keyof CSSStyleDeclaration])() : cssValue;
		
				if (typeof cssEvaluatedValue === "string") {
					style[toKebabCase(cssKey)] = cssEvaluatedValue;
				}
			}
			
			continue;
		}
	
		if (isSignal(value)) {
			var evaluatedValue = value();

			if (typeof evaluatedValue === "string" || typeof evaluatedValue === "boolean") {
				setProperty(container, key, evaluatedValue);
			}

			if (typeof evaluatedValue === "number") {
				setProperty(container, key, evaluatedValue);
			}

			continue;
		}
		
		if (typeof value === "function") {
			if (key.indexOf("on") === 0) {
				// Do nothing on the server
			} else {
				setProperty(container, key, value());
			}
			continue;
		}

		if (typeof value === "string" || typeof value === "boolean") {
			setProperty(container, key, value);
		}

		if (typeof value === "number") {
			setProperty(container, key, String(value));
		}
	}
}
