function TodoList(){
	let todos = [];
	
	return $.html(
		'<form autocomplete="off">',
			$.on("submit", e => {
				e.preventDefault();
				todos.push({
					text: e.target.elements.todotext.value,
					done: false
				});
				e.target.reset();
			}),
			'<input type="text" name="todotext" placeholder="Todo">',
			'<input type="submit" value="Add">',
			'<input type="button" value="Delete all done">',
				$.on("click", () => todos = todos.filter(todo => !todo.done)),
		'</form>',
		
		'<ul>',
			$.map(() => todos, todo => $.html(
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
			)),
		'</ul>'
	);
}
