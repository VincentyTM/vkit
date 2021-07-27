<h1 align="center">vKit</h1>
  
<p align="center">
  <img src="img/vkit-logo-200.png" alt="vKit logo" width="100" height="100">
</p>

<p align="center"><i>vKit</i> is a flexible JavaScript library for building dynamic UI declaratively, handling asynchronous calls, managing threads, serializing forms, parsing syntax, and much more.</p>

<hr>

Example app:

```javascript
function CounterApp(){
    let count = 0;
    return $.html(
        '<input type="button" value="Reset counter">',
            $.prop("disabled", () => count === 0),
            $.on("click", () => count = 0),
            
        '<input type="button" value="Increase count!">',
            $.on("click", () => ++count),
            
        '<br>Click count: ', $.text(() => count)
    );
}

$(document.body).append( CounterApp() );
```

## Table of Contents
  * [Getting Started](#getting-started)
  * [Components](#components)
  * [Dynamic UI](#dynamic-ui)
  * [Conditional Rendering](#conditional-rendering)
  * [Mapping an Array](#mapping-an-array)
  * [Component Lifecycle](#component-lifecycle)
  * [Dependency Injection](#dependency-injection)
  * [Observables and Subscription](#observables-and-subscription)
  * [Serializing a Form](#serializing-a-form)
  * [Cookies](#cookies)
  * [Dragging Elements](#dragging-elements)
  * [Text Selection](#text-selection)
  * [Lexical Scanner](#lexical-scanner)
  * [Syntactic Parser](#syntactic-parser)
  * [Recording Audio](#recording-audio)

## Getting Started

You can manually copy and include the required files from the `src` folder:
```html
<script src="vkit/core.js"></script>
<script src="vkit/dom.js"></script>
<script src="vkit/html.js"></script>
<script src="vkit/component.js"></script>
...
```

Alternatively, you can use the vKit CLI that automatically includes the libraries you need.
1. Run `node index.js`
2. Create/edit your `js` and `css` files inside the `app` directory
3. You can immediately see the changes in your browser
4. Use the `export` command to create a standalone `index.html` file

## Components

The fundamental building block of a vKit application is a view, which is actually a list of DOM nodes. You can create views with the `$.html` function:
```javascript
const myView = $.html(
    '<h1>Hello world</h1>',
    '<p>This is a <code>hello world</code> application.</p>'
);
```
In vKit, a component is a function that returns a view:
```javascript
const HelloComponent = name => $.html(
    '<h1>Hello ', $.createText(name), '</h1>'
);
```
As you can see, the `$.createText` function allows you to safely insert text in HTML. To append a view to `document.body`, just call `append` on it. This will be the root of your application.
```javascript
$(document.body).append( HelloComponent("world") );
```
As you have more components, you can build a tree of them:
```javascript
function App(){
    return $.html(
        '<div>',
            HelloComponent("A"),
        '</div>',
        HelloComponent("B")
    )
}

$(document.body).append( App() );
```
The arguments of `$.html` can be views or functions which are called on the current (previously defined) DOM node.
```javascript
$.html(
    '<form>',
        form => form.onsubmit = e => {
            e.preventDefault();
            console.log("Form was submitted!");
            console.log("Title:", e.target.elements.title.value);
        },
        '<label>',
            'Title: ',
            '<input type="text" name="title">',
                input => input.value = "Example",
        '</label>',
        '<input type="submit" value="Submit!">',
    '</form>'
)
```

You can use `$.template` instead of `$.html` in case you need to replace substrings with views or modifier functions.

```javascript
$.template(
    document.querySelector("template").innerHTML,
    {
        "[count]": () => $.text(() => count),
        "[onIncrease]": () => $.on("click", () => ++count)
    }
)
```

The HTML template:

```html
<template>
    Count: [count]<br>
    <input type="button" value="Increase!">[onIncrease]
</template>
```

## Dynamic UI

Using the `$.text`, `$.prop` and `$.css` functions, you can update DOM nodes dynamically.

> **Important:** `$.text` must not be followed by `$.prop`, `$.css` or `$.on`, as it is not an HTML element.

```javascript
let color = "red";
let text = "Hello world";
let highlight = false;

$.html(
    '<p>',
        $.prop("className", () => highlight ? "highlighted" : ""),
        $.css("color", () => color),
        $.text(() => text),
    '</p>'
)
```
Also, there is `$.effect`, which is called everytime a rerender happens and is not specific to a DOM element.
```javascript
function HelloWorldComponent(){
    let title = "Hello world";
    $.effect(() => document.title = title);
    return $.html('<p>Hello world</p>');
}
```
You can use `$.on` to add an event listener to the current DOM element. After the callback fires, an automatic rerender is triggered.
```javascript
function CounterComponent(){
    let count = 0;
    return $.html(
        $.text(() => count),
        '<input type="button" value="Increase">',
            $.on("click", () => ++count)
    );
}
```
Unless you use `$.on`, you must explicitly call `$.render` inside callback functions. Example:
```javascript
async function load(){
    dataToDisplay = await (await fetch("/api/data")).json();
    $.render();
}

setInterval(() => {
    ++counter;
    $.render();
}, 1000);
```

## Conditional Rendering

Sometimes, modifying DOM nodes is not enough; you may need to replace a whole subtree based on a value. This is exactly what `$.is` is for.
```javascript
function ToggleComponent(){
    let shown = false;
    return $.html(
        '<input type="button">',
            $.prop("value", () => shown ? "Hide" : "Show"),
            $.on("click", () => shown = !shown),
        $.is(
            () => shown,
            isShown => isShown
                ? $.html('<p>This text is currently shown.</p>')
                : $.html()
        )
    );
}
```
The function in the first argument can return any value, not just `true` or `false`. This is useful for creating tabs easily.
```javascript
function TabsComponent(){
    const homeView = HomeComponent();
    const aboutView = AboutComponent();
    let currentView = homeView;
    
    function Tab(title, view){
        return $.html(
            '<input type="button">',
                button => button.value = title,
                $.prop("disabled", () => currentView === view),
                $.on("click", () => currentView = view)
        );
    }
    
    return $.html(
        Tab("Home", homeView),
        Tab("About", aboutView),
        '<hr>',
        $.is(
            () => currentView,
            view => view
        )
    );
}
```

## Mapping an Array

Arrays that can dynamically change can be mapped to a view with the `$.map` function.
```javascript
function BooksTable(books){
    return $.html(
        '<table>',
            '<thead><tr>',
                '<th scope="col">Title</th>',
                '<th scope="col">Author</th>',
                '<th scope="col">Year</th>',
            '</tr></thead>',
            '<tbody>',
                $.map(books, book => $.html('<tr>',
                    '<td>', $.text(() => book.title), '</td>',
                    '<td>', $.text(() => book.author), '</td>',
                    '<td>', $.text(() => book.year), '</td>',
                '</tr>')),
            '</tbody>',
        '</table>'
    );
}
```
Instead of an array (or array-like object), you can pass a function to `$.map` as the first argument that returns an array.

## Component Lifecycle

Components can disappear from the tree when the value of `$.is` changes or the corresponding item is no longer in the array used in `$.map`. When this happens, all side effects caused by creating the component must be reverted. This includes all timeouts, AJAX requests, external state changes initiated by the component.

Fortunately, the `$.unmount` function can be used here.
```javascript
function LocalTimer(){
    const timer = setTimeout(() => alert("Timeout is over"), 1000);
    $.unmount(() => clearTimeout(timeout));
    return $.html('<p>There is an active timer right now.</p>');
}
```
This is what the component lifecycle looks like:
```javascript
function Component(){
    console.log("Component was created.");
    $.effect(() => console.log("Component was updated."));
    $.unmount(() => console.log("Component was destroyed."));
    return $.html('<p>Component</p>');
}
```
Note that no component knows when its view is appended to or removed from the DOM.

In many cases, you should not store your data inside the component, but pass it as an argument or inject a service.

## Dependency Injection

Using `$.inject`, you can avoid unnecessary levels of passing arguments down the component tree. By default, classes are lazily constructed by `$.inject` calls, and injected classes work like singletons.
```javascript
class MyService {
    constructor(){ //No arguments
        this.anotherService = $.inject(AnotherService);
        this.text = "Hello world";
    }
}

function MyComponent(){
    const myService = $.inject(MyService);
    return $.html('<p>', $.text(() => myService.text), '</p>');
}
```
As your application grows, you might need to limit the scope of these services. You can do this easily with `$.provide`.
```javascript
function ProviderComponent(){
    return $.provide([
        MyService,
        AnotherService
    ], MyComponent);
}
```
This means that in the scope of `$.provide` you can access the same instance of the service class, but a different instance outside.

## Observables and Subscription

It may be desirable to subscribe to events. In vKit, the easiest tool for that is `$.observable`, similar to a promise or an event emitter. First you need to `subscribe` to it. Remember to `unsubscribe` when the surrounding component is destroyed (`$.unmount`).
```javascript
class DownloadService {
    constructor(){
        this.onDownload = $.observable();
    }
    async download(url){
        const blob = await (await fetch(url)).blob();
        this.onDownload(blob);
        $.render();
    }
}

function DownloadListComponent(){
    const downloadService = $.inject(DownloadService);
    const downloadedBlobs = [];
    $.unmount(
        downloadService.onDownload.subscribe(
            blob => downloadedBlobs.push(blob)
        )
    );
    return $.html(
        $.map(downloadedBlobs, FileComponent)
    );
}
```

## Serializing a Form

To serialize a form the way you want, you can use `$.serialize`. It iterates over all name-value pairs of the form, just as if it was parsed on the server side.
```javascript
function FormComponent(){
    function onSubmit(e){
        e.preventDefault();
        const data = {};
        $.serialize(this, (name, value) => data[name] = value);
        sendRequest(data);
    }
    
    return $.html('<form>',
        $.on("submit", onSubmit),
        'Name: <input type="text" name="name">',
        '<input type="submit" value="Submit">',
    '</form>');
}
```

## Cookies

There is no easy way to get or set cookies natively. `$.cookie` provides a powerful interface to keep it simple.
```javascript
console.log( $.cookie("name").get() );

$.cookie("name").remove();
$.cookie("name").set("value");

$.cookie.each(cookie => {
    console.log( cookie.name, cookie.value );
    cookie.expires( Date.now() + 30*60*1000 );
    cookie.set("new value");
    cookie.remove();
});
```

## Dragging Elements

You can turn elements to be draggable with both touch and mouse events, move other elements or even perform a custom action.
```javascript
$(myElement).drag();
$(myElement).drag(anotherElement);
$(myElement).drag(anotherElement, onDragStop);
$(myElement).drag((x, y) => {
    if(!isNaN(y)){
        resizeChatbox( Math.max(0, y - chatbox.offsetTop) );
    }
});
$(myElement).dragZone();
```

## Text Selection

A cross-browser implementation of selection in input fields and textareas. It can be used for rich text editors, for example.
```javascript
function EditorComponent(){
    const textarea = $.create("textarea");
    return $.html(
        '<input type="button" value="Insert tab">',
            $.on("click", () => textarea.insertText("\t")),

        '<input type="button" value="Select first character">',
            $.on("click", () => textarea.select(0, 1)),

        '<input type="button" value="Show selected text">',
            $.on("click", () => {
                const selection = textarea.selection();
                console.log(
                    textarea[0].value.substring(
                        selection.start,
                        selection.end
                    )
                );
            }),

        '<br>', textarea
    );
}
```

## Lexical Scanner

To implement a syntax highlighter or parser, you might need a lexical scanner. vKit has a built-in function for that purpose: `$.lexer`.

If your tokens were in an array, you could just simply do this:
```javascript
const tokens = ["while", "(", "i", "<", "5", ")"];
while( tokens.length ){
    process( tokens.shift() );
}
```
Scanning a text very similar. With a set of rules, you can simply iterate over the input text and process the generated tokens on the fly.
```javascript
const text = "while(i<5)";
const rules = {
    "while": /while/,
    "(": /\(/,
    "identifier": /[a-zA-Z][a-zA-Z0-9]*/,
    ")": /\)/,
    "ws": /\s+/
};
const lexer = $.lexer(rules, text);
while(!lexer.ended()){
    process( lexer.shift() );
}
```

## Syntactic Parser

vKit is capable of building a parse tree based on the specified syntactic rules. To see how it works, take a look at this snippet from an equation solver application.
```javascript
const input = "x^2 + 1 = 2*x";
const parseTree = $.parseTree(precedence, left, unary);
const outputMessage = $.parse(
    //Lexer instance
    $.lexer(rules, input),
    
    //Top-level syntax
    ["EXPR", "=", "EXPR"],
    
    //Syntactic rules
    syntax,
    
    //How to apply a rule (optional)
    function(expect, node, replacement){
        if( expect==="EXPR" ){
            if( node.type==="-" ){
                node.type = "negation";
            }
        }
        parseTree.add(node);
    },
    
    //Which tokens to skip (optional)
    node => node.type === "ws"
);

console.log( parseTree.root.toString() );
```
Syntactic rules can be given in the following form. Note that trailing question marks have a special meaning: the referred nonterminal symbol is optional.
```javascript
const syntax = {
    "EXPR": {
        "number": ["EXPR_AFTER?"],
        "(": ["EXPR", ")", "EXPR_AFTER?"],
        "x": ["EXPR_AFTER?"],
        "function": ["(", "EXPR", "COMMA_EXPR?", ")", "EXPR_AFTER?"],
        "-": ["EXPR", "EXPR_AFTER?"]
    },
    "EXPR_AFTER?": {
        "+": ["EXPR"],
        "-": ["EXPR"],
        "*": ["EXPR"],
        "/": ["EXPR"],
        "^": ["EXPR"],
        "composition": ["EXPR"],
        "iteration": ["EXPR"]
    },
    "COMMA_EXPR?": {
        ",": ["EXPR", "COMMA_EXPR?"]
    }
};
```
Precedence, associativity and unarity can be configured such as:
```javascript
const precedence={
    "^": 11,
    "*": 10,
    "/": 10,
    "+": 9,
    "-": 9,
    "negation": 9,
    "=": 6,
    ",": 5
};

const left={
    "*": true,
    "/": true,
    "+": true,
    "-": true,
    "negation": true
};

const unary={
    "negation": true
};
```

## Recording Audio

Since the built-in `MediaRecorder` API has some problems, vKit provides an alternative for audio recording. `$.recorder` can be efficiently used with the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). Its output is a WAV file.
```javascript
const ctx = new AudioContext();

async function recordMicrophone(){
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });
    const source = ctx.createMediaStreamSource(stream);

    const rec = $.recorder(source);
    rec.start();

    return async function(){
        for(const track of stream.getTracks()){
            track.stop();
        }
        rec.stop();
        return await rec.exportWAV();
    };
}
```
