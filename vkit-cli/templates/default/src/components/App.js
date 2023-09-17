function App() {
	const count = $.signal(0);
	
	return [
		H1("Hello world"),
		
		P(
			Img({
				alt: "vKit logo",
				src: "/vkit.svg",
				width: 96,
				height: 96
			})
		),
		
		P(
			$.html`
				This is a new <b>vKit</b> application.
				You may edit <code>src/components/App.js</code> to see some changes.
			`
		),
		
		P(
			Button("Increment click count", {
				onclick() {
					count.add(1);
				}
			}),
			
			Button("Reset click count", {
				disabled: () => count() === 0,
				onclick() {
					count.set(0);
				}
			})
		),
		
		P("You have clicked ", count, () => count() === 1 ? " time." : " times.", (el) => {
			el.className = count();
		}),
		
		$.view(() => {
			if (!$.is(() => count() >= 3)) {
				return null;
			}
			
			console.log("The secret text has appeared!");
			
			$.onUnmount(() => {
				console.log("The secret text has disappeared!");
			});
			
			return P("You have unlocked this secret text!");
		}),
		
		$.style(`
			::this {
				background-color: #f5f5f5;
				color: #000000;
				font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, Arial, Helvetica, Verdana, sans-serif;
				text-align: center;
			}
		`)
	];
}
