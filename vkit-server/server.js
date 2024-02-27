import render from "./render.js";
import {selectRoute} from "../server-libraries/index.js";

export default {
	router: (routes, errorRoutes, staticRoot) => (req, res) => (
		selectRoute(req, res, routes, errorRoutes, staticRoot)
	),
	
	view: (component) => (req, res) => (
		render(req, res, component)
	)
};
