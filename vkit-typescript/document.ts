import bind, {Bindings} from "./bind";
import getWindow from "./window";

function getDocument(...bindings: Bindings[]): Document;
function getDocument() {
	var doc = getWindow().document;
	var n = arguments.length;
	
	for (var i = 0; i < n; ++i) {
		bind(doc, arguments[i]);
	}
	
	return doc;
}

export default getDocument;
