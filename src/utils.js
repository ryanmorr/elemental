const cache = {};
const PROP_TO_ATTR_RE = /\.?([A-Z]+)/g;
const ATTR_TO_PROP_RE = /-([a-z])/g;
const JSON_RE = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;

function isPlainObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(obj);
    return prototype === null || prototype === Object.getPrototypeOf({});
}

function cloneValue(value) {
    if (isPlainObject(value)) {
        return Object.assign({}, value);
    }
    if (Array.isArray(value)) {
        return value.slice();
    }
    return value;
}

function toAttribute(prop) {
    if (prop in cache) {
        return cache[prop];
    }
    return cache[prop] = prop.replace(PROP_TO_ATTR_RE, (match, char) => '-' + char.toLowerCase());
}

export function toProperty(attr) {
    if (attr in cache) {
        return cache[attr];
    }
    return cache[attr] = attr.replace(ATTR_TO_PROP_RE, (match, char) => char.toUpperCase());
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

export function parseAttributeValue(value) {
    if (value === '') {
		return true;
	}
	if (value === +value + '') {
		return +value;
	}
	if (JSON_RE.test(value)) {
        try {
            return JSON.parse(value);
        } catch(e) {
            // eslint-disable no-empty
        }
	}
	return value;
}

export function getObservedAttributes(props) {
    return Object.keys(props).filter((prop) => {
        const value = props[prop];
        const type = typeof value;
        return type === 'string' || type === 'number' || type === 'boolean' || value === null;
    }).map(toAttribute);
}

export function initializeProps(element, props) {
    Object.keys(props).forEach((prop) => {
        let value = cloneValue(props[prop]);
        const attr = toAttribute(prop);
        const attrValue = element.getAttribute(attr);
        if (attrValue != null) {
            value = parseAttributeValue(attrValue);
        } else {
            const type = typeof value;
            if (type === 'string' || type === 'number' || value === true) {
                element.setAttribute(attr, value === true ? '' : value);
            }
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
