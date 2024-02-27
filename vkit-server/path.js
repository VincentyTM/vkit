import history from "./history.js";
import parseURL from "./parseURL.js";

export default function path() {
	return parseURL(history().url()).base;
}
