import queryParamsState from "./queryParamsState.js";

export default function param(name) {
	return queryParamsState()(name);
}
