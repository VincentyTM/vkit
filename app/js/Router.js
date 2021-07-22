function Router(){
	const {router} = $.inject(RouterService);
	
	return router.component([
		{
			path: "#",
			component: Home
		},
		{
			path: "#about",
			component: About
		},
		{
			component: NotFound
		}
	]);
}
