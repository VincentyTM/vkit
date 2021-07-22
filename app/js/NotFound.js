function NotFound(){
	const {router} = $.inject(RouterService);
	
	return $.html(
		'<h2>Not Found</h2>',
		'<p><a>', router.link("#"), 'Back to home page</a></p>'
	);
}
