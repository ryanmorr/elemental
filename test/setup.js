let index = 0;
const elements = [];

export const container = document.createElement('div');
document.body.appendChild(container);

export function generateTagName() {
    return `test-element-${++index}`;
}

export function getTagName() {
    return `test-element-${index}`;
}

export function createTestElement() {
    const element = document.createElement(getTagName());
    elements.push(element);
    return element;
}

export function createHTMLTestElement(attrs = {}) {
    const div = document.createElement('div');
    div.innerHTML = `<${getTagName()} ${Object.keys(attrs).map((name) => `${name}='${attrs[name]}'`).join(' ')}></${getTagName()}>`;
    const element = div.firstChild;
    elements.push(element);
    return element;
}

export function queryShadowRoot(selector) {
    return container.querySelector(getTagName()).shadowRoot.querySelector(selector);
}

export function getStyle(el, prop) {
    return el.ownerDocument.defaultView.getComputedStyle(el).getPropertyValue(prop);
}

afterEach(() => {
    while (elements.length > 0) {
        const element = elements.pop();
        if (element && element.parentNode) {
            element.remove();
        }
    }
});
