import {add, toggle, toStringWritable, update} from "./signalAndComputed.js";

export default function writable(input, setValue) {
    var output = input;
    output.add = add;
    output.set = setValue;
    output.setEagerly = setValue;
    output.toggle = toggle;
    output.toString = toString;
    output.update = update;
    return output;
}
