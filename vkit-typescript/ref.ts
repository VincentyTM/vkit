import onUnmount from "./onUnmount";

type Ref<ValueType> = {
	(value: ValueType): void;
	current: ValueType | null;
};

export default function createRef<ValueType extends object = HTMLElement>() {
	function reset(): void {
		ref.current = null;
	}
	
	var ref = <Ref<ValueType>>function (value: ValueType): void {
		if (ref.current) {
			throw new Error("This reference has already been set.");
		}
		
		ref.current = value;
		onUnmount(reset);
	};
	
	ref.current = null;
	return ref;
}
