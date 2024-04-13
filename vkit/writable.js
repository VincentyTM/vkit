(function($) {

var add = $.signalAdd;
var toggle = $.signalToggle;
var toString = $.signalToString;
var update = $.signalUpdate;

function writable(input, setValue) {
    var output = input;
    output.add = add;
    output.set = setValue;
    output.setEagerly = setValue;
    output.toggle = toggle;
    output.toString = toString;
    output.update = update;
    return output;
}

$.writable = writable;

})($);
