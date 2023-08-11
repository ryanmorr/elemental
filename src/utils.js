const PROP_TO_ATTR_RE = /\.?([A-Z]+)/g;

export function toAttribute(propName) {
    return propName.replace(PROP_TO_ATTR_RE, (match, char) => '-' + char.toLowerCase());
}

export function getCallback(name, callback) {
    return (key, newVal, oldVal) => {
        if (key === name) {
            callback(newVal, oldVal);
        }
    };
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
                const subscribers = element._subscribers.prop;
                if (subscribers) {
                    subscribers.slice().forEach((callback) => callback(prop, newVal, oldVal));
                }
            },
            enumerable: true,
            configurable: true
        });
    });
}
