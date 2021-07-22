function TodoItem(todo){
	return $.html(
		'<li>',
			'<label>',
				'<input type="checkbox">',
					$.prop("checked", () => todo.done),
					$.on("change", e => todo.done = e.target.checked),
				
				$.is(
					() => todo.done,
					done => {
						const text = $.createText(todo.text);
						return done ? $.html('<del>', text, '</del>') : text;
					}
				),
			'</label>',
		'</li>',
	);
}
