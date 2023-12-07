import { initializeProperties, parseAttributeValue, getObservedAttributes, toProperty, applyStyles, getCallback, callStack } from './utils';

function createComponent(props, callback) {
    return class extends HTMLElement {

        static get observedAttributes() {
            return getObservedAttributes(props);
        }

        constructor() {
            super();
            this._initialized = false;
            this._observers = {
                mount: [],
                unmount: [],
                prop: [],
                attr: []
            };
        }

        get html() {
            return this.shadowRoot;
        }

        set html(value) {
            this.shadowRoot.replaceChildren();
            if (typeof value === 'string') {
                this.shadowRoot.innerHTML = value;
            } else {
                this.shadowRoot.appendChild(value);
            }
        }

        set css(value) {
            if (this.shadowRoot) {
                applyStyles(this.shadowRoot, value);
            }
        }

        observe(name, callback) {
            if (name.includes(':')) {
                const parts = name.split(':');
                name = parts[0];
                callback = getCallback(parts[1], callback);
            }
            const observers = this._observers[name];
            if (observers) {
                observers.push(callback);
                return () => {
                    const index = observers.indexOf(callback);
                    if (index !== -1) {
                        observers.splice(index, 1);
                    }
                };
            }
        }

        connectedCallback() {
            if (!this._initialized) {
                initializeProperties(this, props);
                this._initialized = true;
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
            const parent = this.parentElement;
            callStack(this._observers.mount, (callback) => callback(parent));
        }

        disconnectedCallback() {
            callStack(this._observers.unmount, (callback) => callback());
        }

        attributeChangedCallback(attr, oldVal, newVal) {
            if (!this._initialized) {
                return;
            }
            if (oldVal === newVal) {
                return;
            }
            const prop = toProperty(attr);
            this[prop] = parseAttributeValue(newVal);
            callStack(this._observers.attr, (callback) => callback(attr, newVal, oldVal));
        }
    };
}

export default function elemental(name, props, callback) {
    if (typeof props === 'function') {
        callback = props;
        props = {};
    }
    const Component = createComponent(props, callback);    
    customElements.define(name, Component);
    return Component;
}
