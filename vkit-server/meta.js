import {getScope} from "./scope.js";

export default function setMeta(name, content) {
	getScope().addWindowData("meta:" + name, content);
}
