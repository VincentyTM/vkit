import bind, {Bindings} from "./bind";
import getWindow from "./getWindow";

export default function getDocument(..._bindings: Bindings<Document>[]): Document;

export default function getDocument(): Document {
	var doc = getWindow().document;
	var n = arguments.length;
	
	for (var i = 0; i < n; ++i) {
		bind(doc, arguments[i]);
	}
	
	return doc;
}
