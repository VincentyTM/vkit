/**
 * Iterates over input/select/textarea/etc. elements' names and values in a form.
 * It skips nameless and disabled elements.
 * @param form The form element to serialize.
 * @param callback A function called with each input's name and value.
 */
export function serializeForm(
	form: HTMLFormElement,
	callback: (name: string, value: string) => void
): void {
	var submitButton = form.ownerDocument.activeElement;
	var n = form.elements.length;

	for (var i = 0; i < n; ++i) {
		var formControl = form.elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

		if (!formControl.name || formControl.disabled) {
			continue;
		}

		switch (formControl.type) {
			case "submit": case "image":
				if (formControl === submitButton) {
					callback(formControl.name, formControl.value);
				}

				break;
			case "button": case "reset":
				break;
			case "file":
				var input = formControl as HTMLInputElement;

				if (input.files) {
					var n = input.files.length;

					if (n === 0) {
						callback(input.name, "");
					} else {
						for (var k = 0; k < n; ++k) {
							callback(input.name, input.files[k].name);
						}
					}
				} else {
					callback(input.name, input.value);
				}

				break;
			case "checkbox": case "radio":
				var input = formControl as HTMLInputElement;

				if (input.checked) {
					callback(input.name, input.value);
				}

				break;
			case "select-multiple":
				var select = formControl as HTMLSelectElement;
				var m = select.options.length;

				for (var j = 0; j < m; ++j) {
					var option = select.options[j];
					option.selected && callback(select.name, option.value);
				}

				break;
			default:
				callback(formControl.name, formControl.value);
		}
	}
}
