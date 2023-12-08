# elemental

[![Version Badge][version-image]][project-url]
[![License][license-image]][license-url]
[![Build Status][build-image]][build-url]

> A functional approach to creating autonomous custom elements

## Install

Download the [CJS](https://github.com/ryanmorr/elemental/raw/master/dist/cjs/elemental.js), [ESM](https://github.com/ryanmorr/elemental/raw/master/dist/esm/elemental.js), [UMD](https://github.com/ryanmorr/elemental/raw/master/dist/umd/elemental.js) versions or install via NPM:

```sh
npm install @ryanmorr/elemental
```

## Usage

Define an autonomous custom element by providing the tag name and an initialization function:

```javascript
import elemental from '@ryanmorr/elemental';

// Define a custom element and return the class
const CustomElement = elemental('custom-element', (element) => {
    // Return an HTML string or DOM node to set the shadow root content
    return '<div>Hello World</div>';
});

// Create an element instance
const element = document.createElement('custom-element');

// Initialization function is called when the element is mounted to the DOM
document.body.appendChild(element);
```

Optionally define default properties:

```javascript
elemental('custom-element', {msg: 'World'}, (element) => {
    // Default properties are added to the element instance on initialization
    return `Hello ${element.msg}`;
});
```

Default properties with a primitive value (string/number/boolean/null) are automatically reflected into attributes on initialization and observed for changes. After initialization, attribute changes are reflected into properties, but property changes are not reflected into attributes:

```javascript
elemental('custom-element', {foo: 'abc', bar: 123, baz: {}}, (element) => {
    // Primitive default properties are reflected to attributes on initialization
    element.getAttribute('foo'); //=> "abc"
    element.getAttribute('bar'); //=> "123"
    element.getAttribute('baz'); //=> null

    // A property assignment is not reflected into an attribute
    element.foo = 'xyz';
    element.getAttribute('foo'); //=> "abc"

    // Setting an attribute will be reflected into a property 
    // and convert the value to its natural type
    element.setAttribute('bar', '789');
    element.bar; //=> 789 (number not string)
});
```

Subscribe to DOM state changes via the `observe` method:

```javascript
elemental('custom-element', {foo: 'abc', bar: 123}, (element) => {
    // Returns a function to stop future calls
    const stop = element.observe('mount', (parentElement) => {
        // Called everytime the element is mounted to the DOM
    });

    element.observe('unmount', () => {
        // Called everytime the element is unmounted from the DOM
    });

    element.observe('prop', (name, newVal, oldVal) => {
        // Called everytime a default property changes
    });

    element.observe('prop:foo', (newVal, oldVal) => {
        // Called everytime the "foo" property changes
    });

    element.observe('attr', (name, newVal, oldVal) => {
        // Called everytime a reflected attribute changes
    });

    element.observe('attr:bar', (newVal, oldVal) => {
        // Called everytime the "bar" attribute changes
    });
});
```

Use the `html` property to get and set the shadow root:

```javascript
elemental('custom-element', (element) => {
    // Supports HTML strings
    element.html = '<div></div>';
    element.html.innerHTML; //=> "<div></div>"

    // Supports DOM nodes
    element.html = document.createElement('span');
    element.html.innerHTML; //=> "<span></span>"
});
```

Add scoped CSS to the custom element via the `css` property. It supports CSS strings, `<style>` elements, `CSSStyleSheet` instances, or an array of any of those types. Each assignment to the `css` property appends to the CSS and does not replace it:

```javascript
elemental('custom-element', (element) => {
    // Add CSS via string
    element.css = `
        .foo {
            color: red;
        }
    `;

    // Appends <style> element to CSS
    const style = document.createElement('style');
    style.textContent = `
        .bar {
            color: blue;
        }
    `;
    element.css = style;

    // Optionally define CSS within the shadow root using <style> and/or <link> elements
    return `
        <link rel="stylesheet" href="custom-element.css">
        <style>
        .baz {
            color: green;
        }
        </style>
        <div class="foo"></div>
        <div class="bar"></div>
        <div class="baz"></div>
    `;
});
```

## License

This project is dedicated to the public domain as described by the [Unlicense](http://unlicense.org/).

[project-url]: https://github.com/ryanmorr/elemental
[version-image]: https://img.shields.io/github/package-json/v/ryanmorr/elemental?color=blue&style=flat-square
[build-url]: https://github.com/ryanmorr/elemental/actions
[build-image]: https://img.shields.io/github/actions/workflow/status/ryanmorr/elemental/node.js.yml?style=flat-square
[license-image]: https://img.shields.io/github/license/ryanmorr/elemental?color=blue&style=flat-square
[license-url]: UNLICENSE