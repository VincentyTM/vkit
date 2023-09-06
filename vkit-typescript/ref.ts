import onUnmount from "./onUnmount";

type Ref<ValueType> = {
	(value: ValueType): void;
	current: ValueType | null;
};

function createRef<ValueType = HTMLElement>() {
	function reset() {
		ref.current = null;
	}
	
	var ref = <Ref<ValueType>>function (value: ValueType) {
		if (ref.current) {
			throw new Error("This reference has already been set.");
		}
		
		ref.current = value;
		onUnmount(reset);
	};
	
	ref.current = null;
	return ref;
}

export default createRef;
