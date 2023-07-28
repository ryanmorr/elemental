import { initializeProps } from './utils';

export default function elementize(name, props, callback) {
    class CustomElement extends HTMLElement {

        constructor() {
            super();
            this._subscribers = {
                mount: [],
                unmount: [],
                prop: []
            };
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
    
    customElements.define(name, CustomElement);
    return CustomElement;
}
