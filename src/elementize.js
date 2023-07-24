export default function elementize(name, callback) {
    class CustomElement extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({mode: 'open'});
            shadow.appendChild(callback.call(this, this));
        }
    }
    customElements.define(name, CustomElement);
    return CustomElement;
}
