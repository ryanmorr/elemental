import elementize from '../../src/elementize';

describe('elementize', () => {
    let index = 0;
    const elements = [];
    const container = document.createElement('div');
    document.body.appendChild(container);

    const generateTestName = () => `test-element-${++index}`;
    const getTestName = () => `test-element-${index}`;
    const createTestElement = () => {
        const element = document.createElement(getTestName());
        elements.push(element);
        return element;
    };

    afterEach(() => {
        while (elements.length > 0) {
            const element = elements.pop();
            if (element && element.parentNode) {
                element.remove();
            }
        }
    });

    it('should register and create a custom element', () => {
        const callback = sinon.spy();

        const CustomElement = elementize(generateTestName(), {}, callback);

        expect(CustomElement).to.be.a('function');
        expect(callback.callCount).to.equal(0);

        const constructor = customElements.get(getTestName());
        expect(constructor).to.exist;
        expect(constructor).to.equal(CustomElement);

        const element = createTestElement();

        expect(callback.callCount).to.equal(0);

        container.appendChild(element);

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(element);
        expect(callback.calledOn(element)).to.equal(true);

        expect(element.nodeType).to.equal(1);
        expect(element.localName).to.equal(getTestName());
        expect(element).to.be.an.instanceof(CustomElement);
        expect(element).to.be.an.instanceof(HTMLElement);
    });

    it('should support returning shadow content as a DOM node', () => {
        elementize(generateTestName(), {}, () => {
            return document.createTextNode('foo');
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('foo');
    });

    it('should support returning shadow content as an HTML string', () => {
        elementize(generateTestName(), {}, () => {
            return '<div>foo</div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('<div>foo</div>');
    });

    it('should support mount event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTestName(), {}, (element, subscribe) => {
            subscribe('mount', spy);
        });

        const element = createTestElement();

        expect(spy.callCount).to.equal(0);

        container.appendChild(element);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(container);

        element.remove();

        document.body.appendChild(element);

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal(document.body);
    });

    it('should support multiple mount event subscriptions', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {}, (element, subscribe) => {
            subscribe('mount', spy1);
        });

        const element = createTestElement();

        expect(element.subscribe).to.be.a('function');
        element.subscribe('mount', spy2);

        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);

        container.appendChild(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal(container);
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal(container);

        element.remove();

        document.body.appendChild(element);

        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal(document.body);
        expect(spy2.callCount).to.equal(2);
        expect(spy2.args[1][0]).to.equal(document.body);
    });

    it('should support unsubscribing from a mount event subscription', () => {
        let unsubscribe;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {}, (element, subscribe) => {
            unsubscribe = subscribe('mount', spy1);
        });

        const element = createTestElement();

        element.subscribe('mount', spy2);

        document.body.appendChild(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(1);

        element.remove();

        expect(unsubscribe).to.be.a('function');
        unsubscribe();

        container.appendChild(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(2);
    });

    it('should support unmount event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTestName(), {}, (element, subscribe) => {
            subscribe('unmount', spy);
        });

        const element = createTestElement();

        document.body.appendChild(element);

        expect(spy.callCount).to.equal(0);

        element.remove();

        expect(spy.callCount).to.equal(1);

        container.appendChild(element);

        element.remove();

        expect(spy.callCount).to.equal(2);
    });

    it('should support multiple mount event subscriptions', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {}, (element, subscribe) => {
            subscribe('unmount', spy1);
        });

        const element = createTestElement();

        element.subscribe('unmount', spy2);

        document.body.appendChild(element);

        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);

        element.remove();

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(1);

        container.appendChild(element);

        element.remove();

        expect(spy1.callCount).to.equal(2);
        expect(spy2.callCount).to.equal(2);
    });

    it('should support unsubscribing from a mount event subscription', () => {
        let unsubscribe;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {}, (element, subscribe) => {
            subscribe('unmount', spy1);
        });

        const element = createTestElement();
        
        unsubscribe = element.subscribe('unmount', spy2);

        document.body.appendChild(element);

        element.remove();

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(1);

        container.appendChild(element);

        expect(unsubscribe).to.be.a('function');
        unsubscribe();

        element.remove();

        expect(spy1.callCount).to.equal(2);
        expect(spy2.callCount).to.equal(1);
    });

    it('should support properties definition', () => {
        elementize(generateTestName(), {foo: 'bar', baz: 10}, (element) => {
            expect(element.foo).to.equal('bar');
            expect(element.baz).to.equal(10);
        });

        const element1 = createTestElement();

        expect(element1.foo).to.equal(undefined);
        expect(element1.baz).to.equal(undefined);

        container.appendChild(element1);

        expect(element1.foo).to.equal('bar');
        expect(element1.baz).to.equal(10);

        const element2 = createTestElement();

        expect(element2.foo).to.equal(undefined);
        expect(element2.baz).to.equal(undefined);

        container.appendChild(element2);

        expect(element2.foo).to.equal('bar');
        expect(element2.baz).to.equal(10);
    });

    it('should enumerate properties', () => {
        elementize(generateTestName(), {foo: 1, bar: 2, baz: 3, qux: 4}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);
        
        const props = Object.keys(element);

        expect(props).to.include('foo');
        expect(props).to.include('bar');
        expect(props).to.include('baz');
        expect(props).to.include('qux');
    });

    it('should be able to delete a property', () => {
        elementize(generateTestName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        delete element.foo;

        expect(element.foo).to.equal(undefined);
    });

    it('should support prop event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTestName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('prop', spy);
        });

        const element = createTestElement();
        container.appendChild(element);

        expect(spy.callCount).to.equal(0);

        element.foo = 'baz';

        expect(element.foo).to.equal('baz');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal('baz');
        expect(spy.args[0][2]).to.equal('bar');

        element.foo = 'qux';

        expect(element.foo).to.equal('qux');
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('foo');
        expect(spy.args[1][1]).to.equal('qux');
        expect(spy.args[1][2]).to.equal('baz');
    });

    it('should support multiple prop event subscriptions', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('prop', spy1);
        });

        const element = createTestElement();
        container.appendChild(element);

        element.subscribe('prop', spy2);

        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);

        element.foo = 'baz';

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal('foo');
        expect(spy1.args[0][1]).to.equal('baz');
        expect(spy1.args[0][2]).to.equal('bar');

        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal('foo');
        expect(spy2.args[0][1]).to.equal('baz');
        expect(spy2.args[0][2]).to.equal('bar');

        element.foo = 'qux';

        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('foo');
        expect(spy1.args[1][1]).to.equal('qux');
        expect(spy1.args[1][2]).to.equal('baz');

        expect(spy2.callCount).to.equal(2);
        expect(spy2.args[1][0]).to.equal('foo');
        expect(spy2.args[1][1]).to.equal('qux');
        expect(spy2.args[1][2]).to.equal('baz');
    });

    it('should support unsubscribing from a prop event subscription', () => {
        let unsubscribe;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('prop', spy1);
        });

        const element = createTestElement();
        container.appendChild(element);
        
        unsubscribe = element.subscribe('prop', spy2);

        element.foo = 'baz';

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal('foo');
        expect(spy1.args[0][1]).to.equal('baz');
        expect(spy1.args[0][2]).to.equal('bar');

        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal('foo');
        expect(spy2.args[0][1]).to.equal('baz');
        expect(spy2.args[0][2]).to.equal('bar');

        expect(unsubscribe).to.be.a('function');
        unsubscribe();

        element.foo = 'qux';

        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('foo');
        expect(spy1.args[1][1]).to.equal('qux');
        expect(spy1.args[1][2]).to.equal('baz');

        expect(spy2.callCount).to.equal(1);
    });
});
