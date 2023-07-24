const render = require("./render");
const {selectRoute} = require("../server-libraries");

module.exports = {
	router: (routes, errorRoutes, staticRoot) => (req, res) => (
		selectRoute(req, res, routes, errorRoutes, staticRoot)
	),
	
	view: (component) => (req, res) => (
		render(req, res, component)
	)
};
