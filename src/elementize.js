export default function elementize(name, callback) {
    class CustomElement extends HTMLElement {
        constructor() {
            super();
            const shadow = this.attachShadow({mode: 'open'});
            const result = callback.call(this, this);
            if (result) {
                if (typeof result === 'string') {
                    shadow.innerHTML = result;
                } else {
                    shadow.appendChild(result);
                }
            }
        }
    }
    customElements.define(name, CustomElement);
    return CustomElement;
}
