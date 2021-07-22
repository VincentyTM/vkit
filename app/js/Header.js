function Header(){
	const {router} = $.inject(RouterService);
	
	return $.html(
		'<header>',
			'<h1><a>', router.link("#"), 'vKit</a></h1>',
		'</header>'
	);
}
