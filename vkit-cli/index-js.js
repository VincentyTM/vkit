module.exports = `function App(){
	return $.html('Hello world');
}

$(document.body).append( App() );
$.render();
`;
