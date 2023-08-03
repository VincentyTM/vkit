<h1 align="center">vKit</h1>
  
<p align="center">
  <img src="img/vkit-logo-200.png" alt="vKit logo" width="100" height="100">
</p>

<p align="center"><i>vKit</i> is a flexible JavaScript library for building dynamic UI declaratively, handling asynchronous calls, managing threads, serializing forms, parsing syntax, and much more.</p>

<hr>

Example app:

```javascript
const {Br, Button} = $.htmlTags;

function CounterApp() {
    const count = $.signal(0);
    
    return [
        Button("Increment", {
            onclick: () => count.add(1)
        }),
        Button("Reset counter", {
            disabled: () => count() === 0,
            onclick: () => count.set(0)
        }),
        Br(),
        "Click count: ", count
    ];
}

$(document.body).render(CounterApp);
```

## Table of Contents
  * [Getting Started](#getting-started)
  * [Components and Views](#components-and-views)
  * [Styles](#styles)
  * [Signals](#signals)
  * [View Blocks](#view-blocks)
  * [View List Blocks](#view-list-blocks)
  * [Component Lifecycle](#component-lifecycle)
  * [Dependency Injection](#dependency-injection)
  * [Observables and Subscription](#observables-and-subscription)
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

const App = () => [
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

const requestListener = $.server.view((server) => $.htmlString`<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>Example title</title>
        <style>${server.style()}</style>
    </head>
    <body>
        ${App()}
    </body>
</html>`);

http.createServer(requestListener).listen(1234);
```

## Components and Views

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
const {Footer, Header, Main} = $.htmlTags;

function App() {
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

The arguments of element factory functions can be a mix of child nodes to be appended, function directives and property binding objects.
```javascript
Div(
    {
        className: "box",
        style: {
            color: "red"
        }
    },
    H1("Element node"),
    "Text node",
    [
        "Arrays can also be used for grouping",
        {
            style: {
                color: "blue"
            }
        }
    ],
    (div) => console.log("Color:", div.style.color)
)
```

## Event Listeners

You can bind a property named `on*` to attach an event listener to a DOM element.

```javascript
const {Button} = $.htmlTags;

function ClickableButton() {
    return Button("Click me", {
        onclick(event) {
            console.log("Clicked.", event);
        }
    });
}
```

A global event listener can be attached with `bind`. It will be detached when the current component is destroyed.

```javascript
$(document).bind({
    onclick(event) {
        console.log("Clicked.", event);
    }
});
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

function SpecialButton(...args) {
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

## Signals

A signal is a container object whose value may change over time. There are two types of signals: writable and computed (read-only).

### Writable Signals

A writable signal can be created with `$.signal`.

```javascript
const count = $.signal(42);
```

Its value can be written with `set` and read with `get`.

```javascript
count.set(50);
console.log(count.get()); // 50
```

It is also possible to `add` a value, similarly to the `+=` operator.

```javascript
count.add(12); // equivalent to count.set(count.get() + 12);
```

The `toggle` method is useful if the signal contains a boolean value. It transforms `true` into `false` and vice versa.

```javascript
const show = $.signal(false);
show.toggle(); // equivalent to count.set(!count.get());
```

### Computed Signals

A computed (or read-only) signal can be created with `$.computed`. Read-only signals do not have `add`, `set` and `toggle` methods.

```javascript
const myText = $.computed(() => "Hello world");
```

You can use the `()` operator on any signal inside the callback function of `$.computed`. It automatically updates the computed signal when an input signal changes.

```javascript
const name = $.signal("world");
const myText = $.computed(() => "Hello " + name());
```

A computed signal is lazy, which means that its value is not calculated until it is needed somewhere (in the DOM or in a side effect).

```javascript
const notUsedAnywhere = $.computed(() => (
    "This will never be calculated"
));
```

A computed signal caches its value, so unless at least one of its inputs change, the value is not recalculated.

```javascript
const array = $.signal([]);
const query = $.signal("");
const filtered = $.computed(() => (
    array().filter((item) => (
        item.name.contains(query())
    ))
));
```

Computed signals are not immediately updated. The updates are added to a queue instead. To make sure all computed signals are up to date, you can call `$.update`.

```javascript
const a = $.signal(3);
const b = $.signal(5);

const aPlusB = $.computed(() => a() + b());
console.log(aPlusB.get()); // 8

a.set(13);
console.log(aPlusB.get()); // 8

$.update();
console.log(aPlusB.get()); // 18
```

### Using a Signal

A signal can be simply used as a dynamic text in the DOM.

```javascript
const name = $.signal("world");

return P("Hello ", name);
```

It can also be used as a dynamic property of a DOM element.

```javascript
const name = $.signal("world");
const color = $.signal("#ff0000");

return Input({
    value: name,
    style: {
        color
    }
});
```

Attributes can be dynamic too, not just properties.

```javascript
return Div(
    $.attributes({
        "my-attribute": () => name() + "!"
    })
);
```

Side effects can also be created that run when the value of an input signal changes.

```javascript
$.effect(() => {
    console.log(`Hello ${name()}`);
    
    $.onUnmount(() => {
        console.log("Optional cleanup function");
    });
});
```

A dynamic text node can also be created without a computed signal.

```javascript
$.text(() => `Hello ${name()}`)
```

### Mapping Signals

The `$.map` method can be used to create a reusable function that maps input signals to an output signal. Its only parameter is a pure function that returns the output signal's current value.

```javascript
const sum = $.map((x, y) => x + y);
```

It can be used to combine multiple signals into a new (computed) one.

```javascript
const a = $.signal(3);
const b = $.signal(5);
const aPlusB = sum(a, b);
```

You can use the following inline syntax as well.

```javascript
const aPlusB = $(a, b).map((x, y) => x + y);
```

If you need to transform a single signal, you can just simply call `map` on it.

```javascript
const doubleCount = count.map(x => x * 2);
```

This means the same as:

```javascript
const doubleCount = $.computed(() => count() * 2);
```

## View Blocks

Sometimes, modifying existing DOM nodes is not enough. You may want to insert new nodes and remove old ones. A view block is a part of the DOM tree which is destroyed and re-created every time a value changes.

```javascript
$.view(() => show() && Div("This text is shown now!"));
```

Note that there might be unwanted DOM updates which you should avoid.

```javascript
$.view(() => count() > 3 && Div("This text is shown now!"));
```

If you create a boolean computed signal for every condition in `if` statements, unwanted DOM updates will probably not happen.

```javascript
$.view(() => {
    if ($.computed(() => count() > 3)()) {
        return Div("This text is shown now!");
    }
});
```

You can also use the alternative syntax if the view is generated from a single signal.

```javascript
show.view((doShow) => {
    if (doShow) {
        return Div("This text is shown now!");
    }
});
```

## View List Blocks

A view list block can be used to render a dynamic list of views (most commonly list items or table rows) efficiently. First, you need a signal that contains an array.

```javascript
const items = $.signal([
    {
        value: "Hello world"
    }
]);
```

Then you can use its `views` method to create the list items.

```javascript
return Ul(
    items.views((item) => (
        Li(item.value)
    ))
);
```

In some cases you might need to identify array items by a key (a string or a number) instead of their value. You can do this with the `$.useKey` method.

```javascript
const BooksTable = (books) => $.htmlString`
    <table>
        <thead>
            <tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Year</th>
            </tr>
        </thead>
        <tbody>${
            $.useKey(books, "id").views(BookRow)
        }</tbody>
    </table>'
`;

const BookRow = (bookSignal) => $.htmlString`
    <tr>
       <td>${
         $.text(() => bookSignal().title)
       }</td>
        <td>${
         $.text(() => bookSignal().author)
       }</td>
        <td>${
         $.text(() => bookSignal().year)
       }</td>
    </tr>
`;
```

## Component Lifecycle

Components can disappear from the tree when the value of `$.view` changes or the corresponding item is no longer in the array used in `$.views`. When this happens, all side effects caused by creating the component must be reverted. This includes all timeouts, AJAX requests, external state changes initiated by the component.

Fortunately, the `$.onUnmount` function can be used here.

```javascript
function Clock() {
    const date = $.signal(new Date());
    
    const interval = setInterval(() => {
        date.set(new Date());
    }, 1000);
    
    $.onUnmount(() => {
        clearInterval(interval);
    });
    
    return $.computed(() => date().toLocaleString());
}
```

You can enqueue a function to be called after the current render cycle using `$.tick`. This is useful for interacting with the DOM after it has been rendered (e.g. when playing videos, scrolling, measuring CSS properties of elements, auto-focusing).

```javascript
const AutoFocus = (element) => {
    $.tick(() => element.focus());
};

const {Input} = $.htmlTags;

function AutoFocusedInput() {
    return Input(AutoFocus);
}
```

## Dependency Injection

There are two ways a component can get data: from function parameters and from injected services. The difference is that in the latter case, intermediary components do not need to handle data that does not belong to them. By default, service instances are singletons lazily constructed and injected with `$.inject`.

```javascript
const {P} = $.htmlTags;

function MyComponent() {
    const myService = $.inject(MyService);
    
    return P(myService.getText());
}

class MyService {
    constructor() { // No arguments
        this.anotherService = $.inject(AnotherService);
    }
    
    getText() {
        return this.anotherService.text;
    }
}

class AnotherService {
    text = "Hello world";
}
```

As your application grows, you might need to limit the scope of these services. You can do this easily with `$.provide`.

```javascript
function ProviderComponent() {
    return $.provide([
        MyService,
        AnotherService
    ], MyComponent);
}
```

This means that in the scope of `$.provide` you can access the same instance of the service class, but a different instance outside.

## Observables and Subscription

An observable in vKit is a simple function whose behavior is not yet defined during creation.

```javascript
const saveFile = $.observable();
```

You can later subscribe to an observable with `subscribe`.

```javascript
const unsubscribe = saveFile.subscribe((file) => {
    // Save the file somehow
});
```

And when you no longer need to be subscribed, be sure to unsubscribe. Not doing so may lead to memory leaks.

```javascript
$.onUnmount(unsubscribe);
```

An observable can be called like any function. When this happens, all of its subscribers are called with the same arguments. The observable has no return value.
```javascript
saveFile(file);
```

You can also unsubscribe all subscribers with the `clear` method.

```javascript
saveFile.clear();
```

## Routing

Any signal can be used to provide the current path of the application. For instance, vKit has a `$.hash` factory function which can be used for hash based routing. Since its return value is a signal, you can create a view from it.

```javascript
$.hash().view((path) => {
    switch(path) {
        case "": return HomeComponent();
        case "about": return AboutComponent();
        default: return NotFoundComponent();
    }
});
```

vKit provides a `router` function to implement more sophisticated routing.

```javascript
function App() {
    const router = $.router($.hash(), [
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

const {A, Li, Ul} = $.htmlTags;

function MenuComponent(router) {
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
const {A, Li, Ul} = $.htmlTags;

function App() {
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
function InputFocusComponent() {
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

function FormComponent() {
    function onsubmit(e) {
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
const {Div, H1} = $.htmlTags;

$.customElement("hello-element", function({name}) {
    name = $.defaultValue(name, "world");
    
    console.log("The <hello-element> is connected!");
    
    $.onUnmount(() => {
        console.log("The <hello-element> is disconnected!");
    });
    
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

function NewWindowContent({close}) {
    return [
        H1("This is a new window"),
        Button("Close it", {
            onclick: close
        })
    ];
}

function NewWindowOpener() {
    return Button("Open new window", {
        onclick() {
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
    if (!isNaN(y)) {
        resizeChatbox( Math.max(0, y - chatbox.offsetTop) );
    }
});
$(myElement).dragZone();
```

## Text Selection

A cross-browser implementation of selection in input fields and textareas. It can be used for rich text editors, for example.

```javascript
const {Br, Button, Textarea} = $.htmlTags;

function EditorComponent() {
    let textarea;
    
    return $.html(
        Button("Insert tab", {
            onclick() {
                $(textarea).insertText("\t");
            }
        }),
        Button("Select first character", {
            onclick() {
                $(textarea).select(0, 1);
            }
        }),
        Button("Show selected text", {
            onclick() {
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
for (const token of lexer.scan("Hello world")) {
    if (token.type === "whitespace") {
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
    function(expect, node, replacement) {
        if (expect === "EXPR") {
            if (node.type === "-") {
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

async function recordMicrophone() {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
    });
    const source = ctx.createMediaStreamSource(stream);

    const rec = $.audioRecorder(source);
    rec.start();

    return async function() {
        for (const track of stream.getTracks()) {
            track.stop();
        }
        rec.stop();
        return await rec.exportWAV();
    };
}
```
