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
        '<input type="button" value="Reset counter">', {
            disabled: () => count === 0,
            onclick: () => count = 0
        },
        
        '<input type="button" value="Increase count!">', {
            onclick: () => ++count
        },
        
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
  * [States](#states)
  * [Routing](#routing)
  * [References](#references)
  * [Serializing a Form](#serializing-a-form)
  * [Cookies](#cookies)
  * [Dragging Elements](#dragging-elements)
  * [Text Selection](#text-selection)
  * [Lexical Scanner](#lexical-scanner)
  * [Syntactic Parser](#syntactic-parser)
  * [Recording Audio](#recording-audio)

## Getting Started

You can use the vKit CLI that automatically includes the libraries you need:
1. Install [NodeJS](https://nodejs.org/) with npm
2. Run `npm install -g VincentyTM/vkit`
3. Create a project in a directory with `vkit .` or just `vkit`
4. Create/edit your `js` and `css` files inside the generated `src` directory
5. You can immediately see the changes in your browser
6. Use the `export` command to create a standalone `export.html` file

In case you do not want to use the CLI, you can manually include the required files:
```html
<script src="vkit/core.js"></script>
<script src="vkit/dom.js"></script>
<script src="vkit/html.js"></script>
<script src="vkit/component.js"></script>
...
```

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
    '<h1>Hello ', [name], '</h1>'
);
```
As you can see, you can wrap any text in an array to safely insert it in HTML. To append a view to `document.body`, just call `append` on it. This will be the root of your application.
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
        "[onIncrease]": () => ({onclick: () => ++count})
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

As an alternative to `$.html`, you can also create elements with `$.htmlTag`. The syntax is a bit different, but you can combine it with `$.html` by choice.

```javascript
let count = 0;
const {Br, Input} = $.htmlTags;
const myView = [
    "Count: ", $.text(() => count), Br(),
    Input({
        type: "button",
        value: "Increase!",
        onclick: () => ++count
    })
];
```

## Dynamic UI

Using plain objects and `$.text`, you can update DOM nodes dynamically.

```javascript
let color = "red";
let text = "Hello world";
let highlight = false;

$.html(
    '<p>', {
        className: () => highlight ? "highlighted" : "",
        style: {
            color: () => color
        }
    },
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
You can add `on*` properties to attach event listeners to the current DOM element. After the callback fires, an automatic rerender is triggered.
```javascript
function CounterComponent(){
    let count = 0;
    return $.html(
        $.text(() => count),
        '<input type="button" value="Increase">', {
            onclick: () => ++count
        }
    );
}
```
In asynchronous functions and callbacks (other than vKit-specific event handlers) you must explicitly call `$.render`. Example:
```javascript
async function load(){
    const response = await fetch("/api/data");
    dataToDisplay = await response.json();
    $.render();
}

setInterval(() => {
    ++count;
    $.render();
}, 1000);
```

## Conditional Rendering

Sometimes, modifying DOM nodes is not enough; you may need to replace a whole subtree based on a value. This is exactly what `$.is` is for.
```javascript
function ToggleComponent(){
    let shown = false;
    return $.html(
        '<input type="button">', {
            value: () => shown ? "Hide" : "Show",
            onclick: () => shown = !shown,
        },
        $.is(() => shown,
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
    let currentComponent = HomeComponent;
    
    function Tab(title, component){
        return $.html(
            '<input type="button">', {
                value: title,
                disabled: () => currentComponent === component,
                onclick: () => currentComponent = component
            }
        );
    }
    
    return $.html(
        Tab("Home", HomeComponent),
        Tab("About", AboutComponent),
        '<hr>',
        $.is(() => currentComponent, component => component())
    );
}
```
In some cases, it can be more convenient to write a classic `$.ifElse` statement.
```javascript
$.ifElse(
    () => isFirstConditionTrue(), () => {
        return "The first condition is true.";
    },
    
    () => isSecondConditionTrue(), () => {
        return "The first condition is false, but the second condition is true.";
    },
    
    () => {
        return "Both conditions are false.";
    }
)
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

It may be desirable to subscribe to events. In vKit, the easiest tool for that is `$.observable`, similar to a promise or an event emitter. First, you need to `subscribe` to it. Remember to `unsubscribe` when the surrounding component is destroyed (`$.unmount`).
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

## States

The default change detection mechanism in vKit is relatively slow, as all components need to be traversed to find any changes. It can be optimized with immutable objects, but that is still not optimal. However, there is a solution: `$.state`.

```javascript
function Counter(){
    const count = $.state(0);
    return $.html(
        '<input type="button" value="Reset counter">', {
            disabled: count.map(count => count === 0),
            onclick: () => count.set(0)
        },

        '<input type="button" value="Increase count!">', {
            onclick: () => count.add(1)
        },

        '<br>Click count: ', count
    );
}
```

States are container objects. Upon rendering, their descendants ― the so-called derived states ― will be updated up to view level. Multiple states can be combined with pure functions:

```javascript
const a = $.state(3);
const b = $.state(4);
const aPlusB = $(a, b).combine((a, b) => a + b);
//aPlusB.get() === 7
a.set(5);
//aPlusB.get() === 7
$.render();
//aPlusB.get() === 9
```

If you want to transform a single state, you can use `map` instead of `combine`. Note that derived states cannot be set.

```javascript
const x = $.state(5);
const xPlus1 = x.map(x => x + 1);
```

### States inside components

Everything you can do with simple vKit components you can do with states. In order to avoid memory leaks, vKit automatically unsubscribes from parent states when necessary.

```javascript
function MyComponent(someState){
    someState.effect(value => console.log("Value has changed to:", value));
    return ["State value as text: ", someState];
}
```

Conditional rendering and array mapping can even be more readable than without states.

```javascript
function DynamicList(arrayState = $.state([])){
    const {Ul, Li} = $.htmlTags;
    return $.ifElse(
        arrayState.map(array => array.length === 0),
        () =>
            "There are no items in your array.",
        
        () => Ul(arrayState.views(Li))
    );
}
```

If you have a model object, you can intercept its property changes with `observe` without ever explicitly creating or setting a state.

```javascript
class Counter {
    constructor(){
        this.count = 0;
    }
    render(){
        const {count} = $.observe(this);
        return $.html(
            'Count: ', count, '<br>',
            '<input type="button" value="Increase">', {
                onclick: () => ++this.count
            }
        );
    }
}

$(document.body).append( new Counter() );
```

## Routing

Any state can be used to provide the current path of the application. For instance, vKit has a `hashState` factory function which can be used for hash based routing. Since `hashState` is a state, you can create a view from it.

```javascript
$.hashState().view(path => {
    switch( path ){
        case "": return HomeComponent();
        case "about": return AboutComponent();
        default: return NotFoundComponent();
    }
});
```

vKit provides a `router` function to implement more sophisticated routing.

```javascript
function RouterComponent(){
    const router = $.router( $.hashState() );
    return router.component([
        {
            path: "",
            component: HomeComponent
        },
        {
            path: "about",
            component: AboutComponent
        },
        {
            component: NotFoundComponent
        }
    ]);
}
```

It may be useful to combine routing with dependency injection.

```javascript
const Router = () => $.router( $.hashState() );

function App(){
    const router = $.provide([
        {provide: Router, useFactory: Router}
    ], () => [
        MenuComponent(),
        RouterComponent()
    ]);
}

function MenuComponent(){
    const router = $.inject(Router);

    function Link(title, path, exact = true){
        return $.html(
            '<li><a>', {
                href: "#" + path,
                className: $.classNames({
                    "menu-button": true,
                    "menu-button-selected": router.isActive(path, exact)
                })
            },
                [title],
            '</a></li>'
        );
    }
    return $.html(
        '<ul>',
            Link("Home", ""),
            Link("About", "about", false),
        '</ul>'
    );
}

function RouterComponent(){
    const router = $.inject(Router);

    return router.component([
        {
            path: "",
            component: HomeComponent
        },
        {
            path: "about",
            component: AboutComponent
        },
        {
            component: NotFoundComponent
        }
    ]);
}
```

## References

Although element (or other) references can be set with simple functions, there is a built-in `ref` function to create references.

```javascript
function InputFocusComponent(){
    const inputRef = $.ref();
    return $.html(
        '<input>', inputRef,
        '<input type="button" value="Focus">', {
            onclick: () => inputRef.current.focus()
        }
    );
}
```

## Serializing a Form

In order to serialize a form the way you want, you can use `$.serialize`. It iterates over all name-value pairs of the form, just as if it was parsed on the server side.
```javascript
function FormComponent(){
    function onSubmit(e){
        e.preventDefault();
        const data = {};
        $.serialize(this, (name, value) => data[name] = value);
        sendRequest(data);
    }
    
    return $.html('<form>', {
        onsubmit: onSubmit
    },
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
    let textarea;
    return $.html(
        '<input type="button" value="Insert tab">',
            {onclick: () => $(textarea).insertText("\t")},

        '<input type="button" value="Select first character">',
            {onclick: () => $(textarea).select(0, 1)},

        '<input type="button" value="Show selected text">',
            {onclick: () => {
                const selection = $(textarea).selection();
                console.log(
                    textarea.value.substring(
                        selection.start,
                        selection.end
                    )
                );
            }},

        '<br><textarea></textarea>', el => textarea = el
    );
}
```

## Lexical Scanner

To implement a syntax highlighter or parser, you might need a lexical scanner. vKit has a built-in function for that purpose: `$.lexer`.

```javascript
const rules = {
    "identifier": /[a-zA-Z][a-zA-Z0-9]*/,
    "whitespace": /\s+/,
    "illegal": /[^]/
};
const lexer = $.lexer(rules);
```

You can use it to scan your text input and generate tokens.

```javascript
for(const token of lexer.scan("Hello world")){
    if( token.type === "whitespace" ){
        continue;
    }
    console.log(token);
}
```

## Syntactic Parser

vKit is capable of building a parse tree based on the specified syntactic rules. To see how it works, take a look at this snippet from an equation solver application.
```javascript
const input = "x^2 + 1 = 2*x";
const parseTree = $.parseTree(operators);
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
    node => node.type === "whitespace"
);

console.log( parseTree.root.toString() );
```
Syntactic rules can be given in the following form.
```javascript
const syntax = {
    "EXPR": {
        "number": ["EXPR_AFTER"],
        "(": ["EXPR", ")", "EXPR_AFTER"],
        "x": ["EXPR_AFTER"],
        "function": ["(", "ARGS)", "EXPR_AFTER"],
        "+": ["EXPR", "EXPR_AFTER"],
        "-": ["EXPR", "EXPR_AFTER"]
    },
    "EXPR_AFTER": {
        "+": ["EXPR"],
        "-": ["EXPR"],
        "*": ["EXPR"],
        "/": ["EXPR"],
        "^": ["EXPR"],
        "composition": ["EXPR"],
        "iteration": ["EXPR"],
        "": []
    },
    "ARGS)": {
        ")": [],
        "": ["EXPR", "COMMA_EXPR", ")"]
    },
    "COMMA_EXPR": {
        ",": ["EXPR", "COMMA_EXPR"],
        "": []
    }
};
```
Operators can be configured such as:
```javascript
const operators = {
    "^": {
        precedence: 11
    },
    "*": {
        precedence: 10,
        left: true
    },
    "/": {
        precedence: 10,
        left: true
    },
    "+": {
        precedence: 9,
        left: true
    },
    "-": {
        precedence: 9,
        left: true
    },
    "negation": {
        unary: true,
        precedence: 9,
        left: true
    },
    "=": {
        precedence: 6
    },
    ",": {
        precedence: 5
    },
    "(": {
        parenthesis: "opening"
    },
    ")": {
        parenthesis: "closing"
    }
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
