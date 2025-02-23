import {toStringWritable, update} from "./signalAndComputed.js";

export default function writable(input, setValue) {
    var output = input;
    output.set = setValue;
    output.setEagerly = setValue;
    output.toString = toStringWritable;
    output.update = update;
    return output;
}
