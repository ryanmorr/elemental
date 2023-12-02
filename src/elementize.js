import { initializeProperties, parseAttributeValue, getObservedAttributes, toProperty, getCallback, callStack } from './utils';

function createComponent(props, callback) {
    return class extends HTMLElement {

        static get observedAttributes() {
            return getObservedAttributes(props);
        }

        constructor() {
            super();
            this._initialized = false;
            this._subscribers = {
                mount: [],
                unmount: [],
                prop: [],
                attr: []
            };
        }

        set css(value) {
            if (this.shadowRoot) {
                let sheet;
                if (typeof value === 'string') {
                    sheet = new CSSStyleSheet();
                    sheet.replaceSync(value);
                } else {
                    sheet = value;
                }
                if (this.shadowRoot.adoptedStyleSheets.length === 0) { 
                    this.shadowRoot.adoptedStyleSheets = [sheet];
                } else {
                    this.shadowRoot.adoptedStyleSheets.push(sheet);
                }
            }
        }

        subscribe(name, callback) {
            if (name.includes(':')) {
                const parts = name.split(':');
                name = parts[0];
                callback = getCallback(parts[1], callback);
            }
            const subscribers = this._subscribers[name];
            if (subscribers) {
                subscribers.push(callback);
                return () => {
                    const index = subscribers.indexOf(callback);
                    if (index !== -1) {
                        subscribers.splice(index, 1);
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
            callStack(this._subscribers.mount, (callback) => callback(parent));
        }

        disconnectedCallback() {
            callStack(this._subscribers.unmount, (callback) => callback());
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
            callStack(this._subscribers.attr, (callback) => callback(attr, newVal, oldVal));
        }
    };
}

export default function elementize(name, props, callback) {
    if (typeof props === 'function') {
        callback = props;
        props = {};
    }
    const Component = createComponent(props, callback);    
    customElements.define(name, Component);
    return Component;
}
