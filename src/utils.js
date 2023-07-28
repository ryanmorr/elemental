export function initializeProps(element, props) {
    Object.keys(props).forEach((prop) => {
        let value = props[prop];
        Object.defineProperty(element, prop, {
            get() {
                return value;
            },
            set(newVal) {
                const oldVal = value;
                value = newVal;
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
