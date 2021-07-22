function Home(){
	return $.html(
		'<h2>Welcome to vKit</h2>',
		'<p>This is a simple todo list application:</p>',
		TodoList()
	);
}
