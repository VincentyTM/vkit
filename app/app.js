function App(){
	return $.html(
		Header(),
		Menu(),
		Main()
	);
}

$(document.body).append( App() );
