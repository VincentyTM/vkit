<h1 align="center">vKit</h1>
  
<p align="center">
  <img src="img/vkit-logo-200.png" alt="vKit logo" width="100" height="100">
</p>

<p align="center"><i>vKit</i> is a flexible JavaScript library for building dynamic UI declaratively, handling asynchronous calls, managing threads, serializing forms, parsing syntax, and much more.</p>

<hr>

Example app:

```javascript
const {Br, Button} = $.htmlTags;

function CounterApp(){
    let count = 0;
    
    return [
        Button("Increment", {
            onclick: () => ++count
        }),
        Button("Reset counter", {
            disabled: () => count === 0,
            onclick: () => count = 0
        }),
        Br(),
        "Click count: ", $.text(() => count)
    );
}

$(document.body).render(CounterApp);
```

## Table of Contents
  * [Getting Started](#getting-started)
  * [Components](#components)
  * [Styles](#styles)
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
  * [Custom Elements](#custom-elements)
  * [Windows and Components](#windows-and-components)
  * [Cookies](#cookies)
  * [Dragging Elements](#dragging-elements)
  * [Text Selection](#text-selection)
  * [Lexical Scanner](#lexical-scanner)
  * [Syntactic Parser](#syntactic-parser)
  * [Recording Audio](#recording-audio)

## Getting Started

### For the client

You can use the vKit CLI that automatically includes the libraries you need:
1. Install [NodeJS](https://nodejs.org/) with npm
2. Install [Git](https://git-scm.com/download/)
3. Run `npm i -g VincentyTM/vkit`
4. Create a project in a directory with `vkit directoryName`, `vkit .` or just `vkit`
5. Create/edit your `js` and `css` files inside the generated `src` directory
6. You can immediately see the changes in your browser
7. Use the `export` command to create a standalone `html` or `js` file

### For the server

There is also a limited version of vKit that can be run on a NodeJS server. It includes templating, styling and routing but no reactivity.

You can install the vKit module with this command:
`npm i VincentyTM/vkit`

An example server app:
```javascript
const http = require("http");
const $ = require("vkit");

const {A, Li, Main, Nav, Ul} = $.htmlTags;

const RedH1 = $.styledHtmlTag("h1", `::this{color: red;}`);

const Body = () => [
    RedH1("Hello, you are on page ", $.path()),
    Nav(
        Ul(
            Li(A("Home", $.href("?"))),
            Li(A("About", $.href("?page=about")))
        )
    ),
    Main(
        $.router($.param("page"), [
            {
                path: "",
                component: () => "Home"
            },
            {
                path: "about",
                component: () => "About"
            }
        ])
    )
];

const App = () => $.htmlString`<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Example title</title>
        <style>${ $.renderStyle() }</style>
    </head>
    <body>
        ${ Body() }
    </body>
</html>`;

http.createServer($.render(App)).listen(1234);
```

## Components

The fundamental building block of a vKit application is a view. It is most commonly a DOM node, a text or an array but many other types are also allowed. You can create a DOM node list with the `$.html` function:

```javascript
const myView = $.html(
    '<h1>Hello world</h1>',
    '<p>This is a <code>hello world</code> application.</p>'
);
```

Or you can create DOM elements with the `$.htmlTags` proxy object:

```javascript
const {Code, H1, P} = $.htmlTags;

const myView = [
    H1("Hello world"),
    P("This is a ", Code("hello world"), "application.")
];
```

In vKit, a component is a function that returns a view:

```javascript
const HelloComponent = name => $.html('<h1>Hello ', [name], '</h1>');
```

As you can see, you can wrap any text in an array to safely insert it in HTML. Alternatively, you can use tagged templates with `$.htmlString`.

```javascript
const HelloComponent = name => $.htmlString`<h1>Hello ${name}</h1>`;
```

To render a component in `document.body`, just call `render` on it. This is what a typical application root looks like.

```javascript
const App = () => HelloComponent("world");

$(document.body).render(App);
```

As you have more components, you can build a tree of them:

```javascript
function App(){
    const {Footer, Header, Main} = $.htmlTags;

    return [
        Header(
            HelloComponent("A"),
        ),
        Main(
            HelloComponent("B")
        ),
        Footer(
            HelloComponent("C")
        )
    ]
}

$(document.body).render(App);
```

The arguments of element factory functions (the functions returned by the `$.htmlTags` proxy, e.g. `Form`) can be views, objects or functions that can modify the current DOM element.

```javascript
const {Button, Form, Input, Label} = $.htmlTags;

const myForm = Form(
    {
        onsubmit(e){
            e.preventDefault();
            console.log("Form was submitted!");
            console.log("Title:", this.elements.title.value);
        }
    },
    form => {
        console.log("This element is:", form);
    },
    Label(
        "Title: ",
        Input({
            type: "text",
            name: "title",
            value: "Example"
        })
    ),
    Button("Submit!", {
        type: "submit"
    })
)
```

## Styles

The `$.style` method can be used with the special `::this` selector to apply CSS rules to DOM elements easily.

```javascript
const SpecialButtonStyle = $.style(`
    ::this{
        border: 0;
        background-color: #ffffff;
        color: #000000;
        cursor: pointer;
    }
`);

function SpecialButton(...args){
    return $.htmlTags.Button(SpecialButtonStyle, args);
}
```

In many cases, an element and its style can be defined as a component. The `$.styledHtmlTag` method is more useful in this case.

```javascript
const SpecialButton = $.styledHtmlTag("button", `
    ::this{
        border: 0;
        background-color: #ffffff;
        color: #000000;
        cursor: pointer;
    }
`);

const myButton = SpecialButton("Some label");
```

## Dynamic UI

Using plain objects and `$.text`, you can update DOM nodes dynamically.

```javascript
let color = "red";
let text = "Hello world";
let highlight = false;

const {P} = $.htmlTags;

P(
    {
        className: () => highlight ? "highlighted" : "",
        style: {
            color: () => color
        }
    },
    $.text(() => text)
)
```

Also, there is `$.effect`, which is called everytime a rerender happens and is not specific to a DOM element.

```javascript
function HelloWorldComponent(){
    let title = "Hello world";
    
    $.effect(() => {
        document.title = title;
    });
    
    return "Hello world";
}
```

You can add `on*` properties to attach event listeners to a DOM element. After the callback fires, an automatic rerender is triggered.

```javascript
function ClickableButton(){
    const {Button} = $.htmlTags;
    
    return Button("Click me", {
        onclick(){
            console.log("Clicked.");
        }
    });
}
```

In asynchronous functions and callbacks (other than vKit-specific event handlers and methods) you must explicitly call `$.update`.

```javascript
async function load(){
    const response = await fetch("/api/data");
    dataToDisplay = await response.json();
    $.update();
}

setInterval(() => {
    ++count;
    $.update();
}, 1000);
```

## Conditional Rendering

Sometimes, modifying DOM nodes is not enough; you may need to replace a whole subtree based on a value. This is exactly what `$.view` is for.

```javascript
const {Button, P} = $.htmlTags;

function ToggleComponent(){
    let shown = false;
    
    return $.html(
        Button(
            $.text(() => shown ? "Hide" : "Show"),
            {
                onclick: () => shown = !shown,
            }
        ),
        $.view(() => shown, isShown => {
            return isShown && P("This text is currently shown.");
        })
    );
}
```

The function in the first argument can return any value, not just `true` or `false`. This is useful for creating tabs easily.

```javascript
const {Button, Hr} = $.htmlTags;

function TabsComponent(){
    let currentComponent = HomeComponent;
    
    function Tab(title, component){
        return Button(title, {
            disabled: () => currentComponent === component,
            onclick: () => currentComponent = component
        });
    }
    
    return [
        Tab("Home", HomeComponent),
        Tab("About", AboutComponent),
        Hr(),
        $.view(() => currentComponent, component => component())
    ];
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

Items of an array that can dynamically change can be mapped to views with the `$.views` function.

```javascript
function BooksTable(books){
    return $.htmlString`
        <table>
            <thead><tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Year</th>
            </tr></thead>
            <tbody>${
                $.views(books, book => $.htmlString`
                    <tr>
                        <td>${ $.text(() => book.title) }</td>
                        <td>${ $.text(() => book.author) }</td>
                        <td>${ $.text(() => book.year) }</td>
                    </tr>
                `)
            }</tbody>
        </table>'
    `;
}
```

Instead of an array (or array-like object), you can pass a function to `$.views` as the first argument that returns an array.

## Component Lifecycle

Components can disappear from the tree when the value of `$.view` changes or the corresponding item is no longer in the array used in `$.views`. When this happens, all side effects caused by creating the component must be reverted. This includes all timeouts, AJAX requests, external state changes initiated by the component.

Fortunately, the `$.unmount` function can be used here.

```javascript
function LocalTimer(){
    const timer = setTimeout(() => {
        alert("Timeout is over");
    }, 1000);
    
    $.unmount(() => {
        clearTimeout(timeout);
    });
    
    return $.htmlTags.P("A timeout has started...");
}
```

This is what the component lifecycle looks like:

```javascript
function Component(){
    console.log("Component was created.");
    
    $.effect(() => {
        console.log("Component was updated.");
    });
    
    $.unmount(() => {
        console.log("Component was destroyed.");
    });
    
    return $.htmlTags.P("Component");
}
```

Note that no component knows when its view is appended to or removed from the DOM. However, you can enqueue a function to be called after the current render cycle using `$.tick`.

```javascript
function AutoFocusedInput(){
    const {Input} = $.htmlTags;
    
    return Input(
        input => {
            $.tick(() => input.focus());
        }
    );
}
```

In many cases, you should not store your data inside the component, but pass it as an argument or inject it as a service.

## Dependency Injection

Using `$.inject`, you can avoid unnecessary levels of passing arguments down the component tree. By default, singleton instances are constructed lazily and injected by `$.inject`.

```javascript
class MyService {
    constructor(){ // No arguments
        this.anotherService = $.inject(AnotherService);
        this.text = "Hello world";
    }
}

function MyComponent(){
    const myService = $.inject(MyService);
    return $.htmlTags.P( $.text(() => myService.text) );
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
        this.emitDownload = $.observable();
        this.onDownload = this.emitDownload.subscribe;
    }
    async download(url){
        const blob = await (await fetch(url)).blob();
        this.emitDownload(blob);
        $.update();
    }
}

function DownloadListComponent(){
    const downloadService = $.inject(DownloadService);
    const downloadedBlobs = [];
    
    $.unmount(
        downloadService.onDownload(
            blob => downloadedBlobs.push(blob)
        )
    );
    
    return $.views(downloadedBlobs, FileComponent);
}
```

## States

The default change detection mechanism in vKit is relatively slow, as all components need to be traversed to find any changes. It can be optimized with immutable objects, but that is still not optimal. However, there is a solution: `$.state`.

```javascript
function Counter(){
    const count = $.state(0);
    const {Button, Br} = $.htmlTags;
    
    return [
        Button("Reset counter", {
            disabled: count.map(count => count === 0),
            onclick: () => count.set(0)
        }),
        Button("Increment count!", {
            onclick: () => count.add(1)
        }),
        Br(),
        "Click count: ", count
    ];
}
```

States are container objects. Upon rendering, their descendants ― the so-called computed states ― will be updated up to view level. Note that computed states cannot be set. Multiple states can be combined with pure functions:

```javascript
const a = $.state(3);
const b = $.state(4);
const aPlusB = $(a, b).map((a, b) => a + b);
// aPlusB.get() === 7
a.set(5);
// aPlusB.get() === 7
$.update();
// aPlusB.get() === 9
```

You can wrap a pure function in `$.map` and apply it later to states.

```javascript
const sum = $.map((x, y) => x + y);

const a = $.state(3);
const b = $.state(4);
const aPlusB = sum(a, b);
```

You can also transform a single state's value into something else with the `map` method:

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
const isNotEmpty = $.map(array => array.length > 0);

const {Li, Ul} = $.htmlTags;

function DynamicList(arrayState = $.state([])){
    return $.ifElse(
        isNotEmpty(arrayState),
        () => {
            return Ul(arrayState.views(Li));
        },
        () => {
            return "There are no items in your array.";
        }
    );
}
```

If you have a model object, you can intercept its property changes with `stateOf` without ever explicitly creating or setting a state.

```javascript
class Counter {
    constructor(){
        this.count = 0;
    }
    render(){
        const {count} = $.stateOf(this);
        const {Br, Button} = $.htmlTags;
        return [
            "Count: ", count,
            Br(),
            Button("Increment", {
                onclick: () => ++this.count
            })
        );
    }
}

$(document.body).render(() => new Counter());
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
function App(){
    const router = $.router($.hashState(), [
        {
            path: "",
            component: HomeComponent
        },
        {
            path: "about",
            component: AboutComponent,
            exact: false
        },
        {
            component: NotFoundComponent
        }
    ]);
    
    return [
        MenuComponent(router),
        router
    ]);
}

function MenuComponent(router){
    const menuItems = [
        {
            title: "Home",
            path: ""
        },
        {
            title: "About",
            path: "about"
        }
    ];
    const {A, Li, Ul} = $.htmlTags;
    
    return Ul(
        menuItems.map(({title, path}) => Li(
            A(
                title,
                $.href("#" + path),
                {
                    className: $.classNames({
                        "menu-button": true,
                        "menu-button-selected": router.isActive(path)
                    })
                }
            )
        ))
    );
}
```

A dynamic query parameter can be accessed with `$.param`. It can be useful for routing.

```javascript
function App(){
    const router = $.router($.param("page"), [
        {
            path: "a",
            component: () => "Page A"
        },
        {
            path: "b",
            component: () => "Page B"
        }
    ]);
    
    const {A, Li, Ul} = $.htmlTags;
    
    return [
        Ul(
            Li(A("Page A", $.href("?page=a"))),
            Li(A("Page B", $.href("?page=b")))
        ),
        router
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
const {Button, Form, Input, Label} = $.htmlTags;

function FormComponent(){
    function onsubmit(e){
        e.preventDefault();
        const data = {};
        $.serialize(this, (name, value) => data[name] = value);
        sendRequest(data);
    }
    
    return Form(
        {onsubmit},
        Label("Name: ", Input({name: "name"})),
        Button("Submit")
    );
}
```

## Custom Elements

Custom elements can be registered with `$.customElement` to encapsulate some functionality. They have their own component tree and can be used by non-vKit applications.

```javascript
$.customElement("hello-element", function({name}){
    name = $.defaultValue(name, "world");
    
    console.log("The <hello-element> is connected!");
    
    $.unmount(() => {
        console.log("The <hello-element> is disconnected!");
    });
    
    const {Div, H1} = $.htmlTags;
    
    return $.shadow(
        H1("Hello ", name),
        Div(this.childNodes)
    );
}, {
    observedAttributes: ["name"]
});

const {Hello_Element, P} = $.htmlTags;
const App = () => Hello_Element(
    $.attributes({
        name: "world"
    }),
    P("Some contents")
);
$(document.body).render(App);
```

## Windows and Components

Creating a component in another window (e.g. a tab or an iframe) is difficult because it might get unloaded before your app does and the side effects remain. To avoid this, you should use `renderDetached`.

```javascript
const {Button, H1} = $.htmlTags;

function NewWindowContent({close}){
    return [
        H1("This is a new window"),
        Button("Close it", {
            onclick: close
        })
    ];
}

function NewWindowOpener(){
    return Button("Open new window", {
        onclick(){
            const myWindow = window.open();
            
            $(myWindow.document.body).renderDetached(unmount => {
                $(myWindow).bind({onunload: unmount});
                
                return NewWindowContent({
                    close: () => myWindow.close()
                });
            });
        }
    });
}
```

## Cookies

There is no easy way to get or set cookies natively. `$.cookie` provides a powerful interface for this purpose.

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
const {Br, Button, Textarea} = $.htmlTags;

function EditorComponent(){
    let textarea;
    
    return $.html(
        Button("Insert tab", {
            onclick(){
                $(textarea).insertText("\t");
            }
        }),
        Button("Select first character", {
            onclick(){
                $(textarea).select(0, 1);
            }
        }),
        Button("Show selected text", {
            onclick(){
                const selection = $(textarea).selection();
                console.log(
                    textarea.value.substring(
                        selection.start,
                        selection.end
                    )
                );
            }
        }),
        Br(),
        textarea = Textarea()
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
    // Lexer instance
    $.lexer(rules, input),
    
    // Top-level syntax
    ["EXPR", "=", "EXPR"],
    
    // Syntactic rules
    syntax,
    
    // How to apply a rule (optional)
    function(expect, node, replacement){
        if( expect === "EXPR" ){
            if( node.type === "-" ){
                node.type = "negation";
            }
        }
        parseTree.add(node);
    },
    
    // Which tokens to skip (optional)
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
        "precedence": 11
    },
    "*": {
        "precedence": 10,
        "left": true
    },
    "/": {
        "precedence": 10,
        "left": true
    },
    "+": {
        "precedence": 9,
        "left": true
    },
    "-": {
        "precedence": 9,
        "left": true
    },
    "negation": {
        "unary": true,
        "precedence": 9,
        "left": true
    },
    "=": {
        "precedence": 6
    },
    ",": {
        "precedence": 5
    },
    "(": {
        "parenthesis": "opening"
    },
    ")": {
        "parenthesis": "closing"
    }
};
```

## Recording Audio

Since the built-in `MediaRecorder` API has some problems, vKit provides an alternative for audio recording. `$.audioRecorder` can be efficiently used with the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). Its output is a WAV file.

```javascript
const ctx = new AudioContext();

async function recordMicrophone(){
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });
    const source = ctx.createMediaStreamSource(stream);

    const rec = $.audioRecorder(source);
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
