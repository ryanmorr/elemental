const cache = {};
const PROP_TO_ATTR_RE = /\.?([A-Z]+)/g;
const ATTR_TO_PROP_RE = /-([a-z])/g;

export function toProp(attrName) {
    if (attrName in cache) {
        return cache[attrName];
    }
    return cache[attrName] = attrName.replace(ATTR_TO_PROP_RE, (match, char) => char.toUpperCase());
}

export function toAttribute(propName) {
    if (propName in cache) {
        return cache[propName];
    }
    return cache[propName] = propName.replace(PROP_TO_ATTR_RE, (match, char) => '-' + char.toLowerCase());
}

export function getCallback(name, callback) {
    return (key, newVal, oldVal) => {
        if (key === name) {
            callback(newVal, oldVal);
        }
    };
}

export function callStack(stack, callback) {
    if (stack) {
        stack.slice().forEach(callback);
    }
}

export function initializeProps(element, props) {
    Object.keys(props).forEach((prop) => {
        let value = props[prop];
        const attr = toAttribute(prop);
        const attrValue = element.getAttribute(attr);
        if (attrValue) {
            value = attrValue;
        } else {
            element.setAttribute(attr, value);
        }
        Object.defineProperty(element, prop, {
            get() {
                return value;
            },
            set(newVal) {
                const oldVal = value;
                value = newVal;
                if (oldVal === newVal) {
                    return;
                }
                callStack(element._subscribers.prop, (callback) => callback(prop, newVal, oldVal));
            },
            enumerable: true,
            configurable: true
        });
    });
}
