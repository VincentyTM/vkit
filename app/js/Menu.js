function Menu(){
	const {router} = $.inject(RouterService);
	
	const menuItems = [
		{
			title: "Home",
			path: "#"
		},
		{
			title: "About",
			path: "#about"
		}
	];
	
	return $.html(
		'<nav>',
			'<ul>',
				menuItems.map(item => $.html(
					'<li><a>',
						router.link(item.path, active => active ? "active" : ""),
						$.createText(item.title),
					'</a></li>'
				)),
			'</ul>',
		'</nav>'
	);
}
