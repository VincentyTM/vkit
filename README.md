<h1 align="center">vKit</h1>
  
<p align="center">
  <img src="img/vkit-logo-200.png" alt="vKit logo" width="100" height="100">
</p>

<p align="center"><i>vKit</i> is a flexible JavaScript/TypeScript library for building dynamic UI declaratively, handling asynchronous calls, managing threads, serializing forms, parsing syntax, and much more.</p>

<hr>

Example app using the TypeScript module:

```javascript
import { htmlTag, signal, render } from "vkit-js";

const Br = htmlTag("br");
const Button = htmlTag("button");

function CounterApp() {
    const count = signal(0);
    
    return [
        Button("Increment", {
            onclick: () => count.update(x => x + 1)
        }),
        Button("Reset counter", {
            disabled: () => count() === 0,
            onclick: () => count.set(0)
        }),
        Br(),
        "Click count: ", count
    ];
}

render(CounterApp, document.body);
```

## Table of Contents
  * [Getting Started](#getting-started)
  * [Components and Templates](#components-and-templates)
  * [Styles](#styles)
  * [Signals](#signals)
  * [View Blocks](#view-blocks)
  * [View List Blocks](#view-list-blocks)
  * [Component Lifecycle](#component-lifecycle)
  * [Dependency Injection](#dependency-injection)
  * [References](#references)
  * [Custom Elements](#custom-elements)

## Getting Started

Before using vKit, you need to have [NodeJS](https://nodejs.org/) installed with npm.

### Install as a TypeScript module

You can add vKit to your existing TypeScript web project:
1. Install vKit with `npm i vkit-js`
2. Import the methods you wish to use

You can import the dependencies by name:
`import { htmlTags, render, signal } from "vkit-js";`

### Use the CLI

You can also use the vKit CLI if you do not want to use any other build tools and you prefer simple JavaScript:
1. Run `npm i -g vkit-js` to install vKit globally
2. Run `vkit` to create/open a project in the current directory

If you edit your `js` and `css` files inside the generated `src` directory, you can immediately see the changes in your browser. The `$` object will contain vKit's methods.

Use the `export` command to create a standalone `html` or `js` file.

### Use on the server

vKit supports universal JavaScript, allowing you to run it seamlessly on a Node.js server. For client-side interactivity, you need to include a script element to load the necessary JavaScript.

You can install the vKit module with this command:
`npm i vkit-js`

An example server app:
```javascript
// App.js (universal code)

import { classes, href, htmlTags, param, path } from "vkit-js";

const {A, Body, Li, H1, Head, Main, Nav, Ul} = htmlTags;

export function App() {
    const page = param("page");

    return [
        H1(classes("red"), "Hello, you are on page ", path()),
        Nav(
            Ul(
                Li(A("Home", href("?"))),
                Li(A("About", href("?page=about")))
            )
        ),
        Main(
            view(() => {
                switch (page()) {
                    case "": return "Home";
                    case "about": return "About";
                    default: return "Not Found";
                }
            })
        )
    ];
}


// server.js (server-only code)

import http from "http";
import { html, htmlTags, renderToStream } from "vkit-js";
import { App } from "./App.js";

const {Body, Head, Html, Script, Style, Title} = htmlTags;

function Document() {
    // The App component can modify the server template, enabling the configuration
    // of html, head and body elements through services. Therefore, it is recommended
    // to instantiate App before constructing the server template.
    const app = App();

    return [
        html("<!DOCTYPE html>"),
        Html(
            Head(
                Title("Example App"),
                Style(".red { color: red; }")
            ),
            Body(
                app,
                Script({
                    src: "/bundle.js" // Required for interactivity (use your own URL).
                })
            )
        )
    ];
}

async function requestListener(req, res) {
    // Optionally perform asynchronous operations here, such as fetching data.

    res.setHeader("content-type", "text/html; charset=utf-8");

    renderToStream(res, Document, {
        request: req,
        response: res
    });

    res.end();
}

http.createServer(requestListener).listen(1234);


// bundle.js (client-only code)

import { render } from "vkit-js";
import { App } from "./App.js";

render(App, document.body);
```

## Components and Templates

The fundamental building block of a vKit application is a component, which is a function that returns a template. This is a component:

```javascript
const App = () => "Hello world";
```

As you can see, even a simple string can be a template. It can be used to render a text node. There are templates available for rendering HTML and SVG elements as well.

```javascript
import { htmlTag } from "vkit-js";

const H1 = htmlTag("h1");

const App = () => H1("Hello world");
```

The same HTML tags will be used in many components, so it is worth moving them to a separate file and import them from there.

```javascript
export const Button = htmlTag("button");
export const Div = htmlTag("div");
export const H1 = htmlTag("h1");
export const Input = htmlTag("input");
export const P = htmlTag("p");
```

An element's properties can be modified with objects. These objects are templates themselves.

```javascript
function App() {
    return Input({value: "Hello world"});
}
```

Using the `style` key, you can set inline CSS properties.

```javascript
function App() {
    return H1("Hello world", {
        style: {
            color: "red"
        }
    });
}
```

The elements can have any number of parameters, each one being a template. They can easily be nested:

```javascript
function App() {
    return Div(
        H1("Hello world"),
        Input({value: "Hello world"})
    );
}
```

It is also possible to render multiple elements without having to define a container for them. For this, you can simply wrap them in an array.

```javascript
function App() {
    return [
        H1("Hello world"),
        Input({value: "Hello world"})
    ];
}
```

A template serves as a blueprint and describes what should be rendered when `render` is called. Once a template is rendered, the corresponding DOM nodes are created (or even existing DOM nodes may be reused in a process called hydration).

To render a component in `<body>` (or any other container element), just call `render`. This is what a typical application root looks like:

```javascript
render(App, document.body);
```

As you have more components, you can build a tree of them:

```javascript
import { Footer, H1, Header, Main } from "./htmlTags.js";

function Hello(name) {
    return H1("Hello ", name);
}

function App() {
    return [
        Header(Hello("A")),
        Main(Hello("B")),
        Footer(Hello("C")),
    ]
}

render(App, document.body);
```

## Event Listeners

You can bind a property named `on*` to attach an event listener to a DOM element.

```javascript
function ClickableButton() {
    return Button("Click me", {
        onclick(event) {
            console.log("Clicked.", event);
        }
    });
}
```

## Styles

The `style` method can be used to apply CSS rules to DOM elements easily.

```javascript
import { style } from "vkit-js";
import { Button } from "./htmlTags.js";

export function SpecialButton(...args) {
    return Button(SpecialButtonStyle, args);
}

const SpecialButtonStyle = style({
    backgroundColor: [
        {value: "#ffffff"},
        {on: ":hover", value: "#00ff00"}
    ],
    display: [
        {media: "screen and (max-width: 30em)", value: "block"}
    ],
    border: "0",
    color: "#000000",
    cursor: "pointer"
});
```

## Signals

A signal is a container object whose value may change over time. There are two types of signals: writable and computed (read-only).

### Writable Signals

A writable signal can be created with `signal`.

```javascript
const count = signal(42);
```

Its value can be written with `set` and read with `get`.

```javascript
count.set(50);
console.log(count.get()); // 50
```

It is also possible to `update` a value using a function.

```javascript
count.update(x => x + 12); // equivalent to count.set(count.get() + 12);
count.update((x, y) => x + y, 12); // an extra parameter may be used to pass data to the function
```

### Computed Signals

A computed (or read-only) signal can be created with `computed`. Read-only signals do not have `set` and `update` methods.

```javascript
const myText = computed(() => "Hello world");
```

You can use the `()` operator on any signal inside the callback function of `computed`. It automatically updates the computed signal when an input signal changes.

```javascript
const name = signal("world");
const myText = computed(() => `Hello ${name()}`);
```

A computed signal is lazy, which means that its value is not calculated until it is needed somewhere (in the DOM or in a side effect).

```javascript
const notUsedAnywhere = computed(() => (
    "This will never be calculated"
));
```

A computed signal caches its value, so unless at least one of its inputs change, the value is not recalculated.

```javascript
const array = signal([]);
const query = signal("");
const filtered = computed(() => (
    array().filter((item) => (
        item.name.contains(query())
    ))
));
```

Computed signals are not immediately updated. The updates are added to a queue instead. To make sure all computed signals are up to date, you can call `update`.

```javascript
const a = signal(3);
const b = signal(5);

const aPlusB = computed(() => a() + b());
console.log(aPlusB.get()); // 8

a.set(13);
console.log(aPlusB.get()); // 8

update();
console.log(aPlusB.get()); // 18
```

### Using a Signal

A signal can be simply used as a dynamic text in the DOM.

```javascript
const name = signal("world");

return P("Hello ", name);
```

It can also be used as a dynamic property of a DOM element.

```javascript
const name = signal("world");
const color = signal("#ff0000");

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
    attribute("my-attribute", () => name() + "!")
);
```

Or classes.

```javascript
return Div(
    classes({
        "my-class": () => isMyClassTrue()
    })
);
```

Side effects can also be created that run when the value of an input signal changes.

```javascript
effect(() => {
    console.log(`Hello ${name()}`);
    
    onDestroy(() => {
        console.log("Optional cleanup function");
    });
});
```

### Mapping Signals

In many cases, a computed signal only has a single input. In that case, the mapping can be simplified. Just simply call `map` on the input signal.

```javascript
const doubleCount = count.map(x => x * 2);
```

This means the same as:

```javascript
const doubleCount = computed(() => count() * 2);
```

## View Blocks

Sometimes, modifying existing DOM nodes is not enough. You may want to insert new nodes and remove old ones. A view block is a part of the DOM tree which is destroyed and re-created every time a value changes.

```javascript
return view(() => show() && Div("This text is shown now!"));
```

Note that unwanted DOM updates may occur if you use a non-boolean signal as a condition.

```javascript
return view(() => count() > 3 && Div("Do not do this"));
```

If you first create a boolean computed signal outside the view block and call it inside, these unwanted DOM updates can be avoided.

```javascript
const show = computed(() => count() > 3);

return view(() => show() && Div("Do this instead"));
```

## View List Blocks

A view list block can be used to render a dynamic list of views (most commonly list items or table rows) efficiently. First, you need a signal that contains an array.

```javascript
const items = signal([
    {
        value: "Hello world"
    }
]);
```

Then you can use `viewList` to create the list items.

```javascript
return Ul(
    viewList(items, (item) => (
        Li(item.value)
    ))
);
```

In some cases you might need to identify array items by a key (a string or a number) instead of their value. You can do this with the `useKey` method.

```javascript
const BooksTable = (books) => html`
    <table>
        <thead>
            <tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Year</th>
            </tr>
        </thead>
        <tbody>${
            useKey(books, "id").viewList(BookRow)
        }</tbody>
    </table>'
`;

const BookRow = (bookSignal) => html`
    <tr>
       <td>${() => bookSignal().title}</td>
       <td>${() => bookSignal().author}</td>
       <td>${() => bookSignal().year}</td>
    </tr>
`;
```

## Component Lifecycle

Components can disappear from the tree when the value of `view` changes or the corresponding item is no longer in the array used in `viewList`. When this happens, all side effects caused by creating the component must be reverted. This includes all timeouts, AJAX requests, external state changes initiated by the component.

Fortunately, the `onDestroy` function can be used here.

```javascript
function Clock() {
    const date = signal(new Date());
    
    const interval = setInterval(() => {
        date.set(new Date());
    }, 1000);
    
    onDestroy(() => {
        clearInterval(interval);
    });
    
    return computed(() => date().toLocaleString());
}
```

You can enqueue a function to be called after the current render cycle using `tick`. This is useful for interacting with the DOM after it has been rendered (e.g. when playing videos, scrolling, measuring CSS properties of elements, auto-focusing).

```javascript
const AutoFocus = directive((element) => {
    tick(() => element.focus());
});

function AutoFocusedInput() {
    return Input(AutoFocus);
}
```

## Dependency Injection

There are two ways a component can get data: from function parameters and from injected services. The difference is that in the latter case, intermediary components do not need to handle data that does not belong to them. By default, service instances are singletons lazily constructed and injected with `inject`.

```javascript
function MyComponent() {
    const myService = inject(MyService);
    
    return P(myService.getText());
}

const MyService = createInjectable(() => ({
    anotherService: inject(AnotherService),
    
    getText() {
        return this.anotherService.text;
    }
}));

const AnotherService = createInjectable(() => ({
    text: "Hello world"
}));
```

As your application grows, you might need to limit the scope of these services. You can do this easily with `provide`.

```javascript
function ProviderComponent() {
    return provide([
        MyService,
        AnotherService
    ], MyComponent);
}
```

This means that in the scope of `provide` you can access the same instance of the service class, but a different instance outside.

## References

Although element (or other) references can be set with simple functions, there is a built-in `ref` function to create references.

```javascript
function InputFocusComponent() {
    const inputRef = ref();
    
    return html(
        '<input>', inputRef,
        '<input type="button" value="Focus">', {
            onclick: () => inputRef.current.focus()
        }
    );
}
```
