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
			$.map(() => todos, TodoItem),
		'</ul>'
	);
}
