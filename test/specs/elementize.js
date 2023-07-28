import elementize from '../../src/elementize';

describe('elementize', () => {
    let index = 0;
    const generateTagName = () => `test-element-${++index}`;
    const getTagName = () => `test-element-${index}`;

    const container = document.createElement('div');
    document.body.appendChild(container);

    it('should register and create a custom element', () => {
        const callback = sinon.spy(function() {
            return document.createTextNode('foo');
        });

        const CustomElement = elementize(generateTagName(), {}, callback);

        expect(CustomElement).to.be.a('function');
        expect(callback.callCount).to.equal(0);

        const constructor = customElements.get(getTagName());
        expect(constructor).to.exist;
        expect(constructor).to.equal(CustomElement);

        const element = document.createElement(getTagName());

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(element);
        expect(callback.calledOn(element)).to.equal(true);

        expect(element.nodeType).to.equal(1);
        expect(element.localName).to.equal(getTagName());
        expect(element.shadowRoot.textContent).to.equal('foo');
        expect(element).to.be.an.instanceof(CustomElement);
        expect(element).to.be.an.instanceof(HTMLElement);
    });

    it('should support shadow content as an HTML string', () => {
        elementize(generateTagName(), {}, () => {
            return '<div>foo</div>';
        });

        const element = document.createElement(getTagName());
        expect(element.shadowRoot.innerHTML).to.equal('<div>foo</div>');
    });

    it('should support not returning shadow content', () => {
        const spy = sinon.spy();
        elementize(generateTagName(), {}, spy);

        const element = document.createElement(getTagName());
        expect(element.shadowRoot.innerHTML).to.equal('');
    });

    it('should support mount event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), {}, (element, subscribe) => {
            subscribe('mount', spy);
        });

        const element = document.createElement(getTagName());

        expect(spy.callCount).to.equal(0);

        document.body.appendChild(element);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(document.body);

        element.remove();

        container.appendChild(element);

        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal(container);

        element.remove();
    });

    it('should support multiple mount event subscriptions', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTagName(), {}, (element, subscribe) => {
            subscribe('mount', spy1);
        });

        const element = document.createElement(getTagName());

        expect(element.subscribe).to.be.a('function');
        element.subscribe('mount', spy2);

        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);

        document.body.appendChild(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal(document.body);
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal(document.body);

        element.remove();

        container.appendChild(element);

        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal(container);
        expect(spy2.callCount).to.equal(2);
        expect(spy2.args[1][0]).to.equal(container);

        element.remove();
    });

    it('should support unsubscribing from a mount event subscription', () => {
        let unsubscribe;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTagName(), {}, (element, subscribe) => {
            unsubscribe = subscribe('mount', spy1);
        });

        const element = document.createElement(getTagName());

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

        element.remove();
    });

    it('should support unmount event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), {}, (element, subscribe) => {
            subscribe('unmount', spy);
        });

        const element = document.createElement(getTagName());

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
        
        elementize(generateTagName(), {}, (element, subscribe) => {
            subscribe('unmount', spy1);
        });

        const element = document.createElement(getTagName());

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
        
        elementize(generateTagName(), {}, (element, subscribe) => {
            subscribe('unmount', spy1);
        });

        const element = document.createElement(getTagName());
        
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
        elementize(generateTagName(), {foo: 'bar', baz: 10}, function() {
            expect(this.foo).to.equal('bar');
            expect(this.baz).to.equal(10);
        });

        const element1 = document.createElement(getTagName());
        expect(element1.foo).to.equal('bar');
        expect(element1.baz).to.equal(10);

        const element2 = document.createElement(getTagName());
        expect(element2.foo).to.equal('bar');
        expect(element2.baz).to.equal(10);
    });

    it('should enumerate properties', () => {
        elementize(generateTagName(), {foo: 1, bar: 2, baz: 3, qux: 4}, () => 'foo');

        const element = document.createElement(getTagName());
        
        const props = Object.keys(element);

        expect(props).to.include('foo');
        expect(props).to.include('bar');
        expect(props).to.include('baz');
        expect(props).to.include('qux');
    });

    it('should be able to delete a property', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = document.createElement(getTagName());

        delete element.foo;

        expect(element.foo).to.equal(undefined);
    });

    it('should support prop event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('prop', spy);
        });

        const element = document.createElement(getTagName());

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
        
        elementize(generateTagName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('prop', spy1);
        });

        const element = document.createElement(getTagName());

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
        
        elementize(generateTagName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('prop', spy1);
        });

        const element = document.createElement(getTagName());
        
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
