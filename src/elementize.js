import { initializeProps, toAttribute, toProp } from './utils';

function createComponent(props, callback) {
    return class extends HTMLElement {

        constructor() {
            super();
            this._initialized = false;
            this._subscribers = {
                mount: [],
                unmount: [],
                prop: []
            };
        }

        subscribe(name, callback) {
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
                initializeProps(this, props);
                const shadow = this.attachShadow({mode: 'open'});
                const result = callback.call(this, this, this.subscribe.bind(this));
                if (result) {
                    if (typeof result === 'string') {
                        shadow.innerHTML = result;
                    } else {
                        shadow.appendChild(result);
                    }
                }
                this._initialized = true;
            }
            const subscribers = this._subscribers.mount;
            if (subscribers) {
                const parent = this.parentElement;
                subscribers.slice().forEach((callback) => callback(parent));
            }
        }

        disconnectedCallback() {
            const subscribers = this._subscribers.unmount;
            if (subscribers) {
                subscribers.slice().forEach((callback) => callback());
            }
        }
    }
}

export default function elementize(name, props, callback) {
    const Component = createComponent(props, callback);    
    customElements.define(name, Component);
    return Component;
}
