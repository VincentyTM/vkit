function App(){
	return $.html(
		'<p>Hello world</p>'
	);
}

$(document.body).append( App() );
