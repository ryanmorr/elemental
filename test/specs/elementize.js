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

    const createHTMLTestElement = (attributes = {}) => {
        const div = document.createElement('div');
        div.innerHTML = `<${getTestName()} ${Object.keys(attributes).map((name) => `${name}="${attributes[name]}"`).join('')}></${getTestName()}>`;
        const element = div.firstChild;
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
        const spy = sinon.spy();

        const CustomElement = elementize(generateTestName(), {}, spy);

        expect(CustomElement).to.be.a('function');
        expect(spy.callCount).to.equal(0);

        const constructor = customElements.get(getTestName());
        expect(constructor).to.exist;
        expect(constructor).to.equal(CustomElement);

        const element = createTestElement();

        expect(spy.callCount).to.equal(0);

        container.appendChild(element);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(element);
        expect(spy.calledOn(element)).to.equal(true);

        expect(element.nodeType).to.equal(1);
        expect(element.localName).to.equal(getTestName());
        expect(element).to.be.an.instanceof(CustomElement);
        expect(element).to.be.an.instanceof(HTMLElement);
    });

    it('should not invoke the initialization function twice', () => {
        const spy = sinon.spy();

        elementize(generateTestName(), {}, spy);

        expect(spy.callCount).to.equal(0);

        const element = createTestElement();

        container.appendChild(element);

        expect(spy.callCount).to.equal(1);

        element.remove();

        document.body.appendChild(element);

        expect(spy.callCount).to.equal(1);
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

    it('should support default properties definition', () => {
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

    it('should update multiple properties', () => {
        elementize(generateTestName(), {foo: 'a', bar: 1}, () => 'foo');

        const element = createTestElement();

        expect(element.foo).to.equal(undefined);
        expect(element.bar).to.equal(undefined);

        container.appendChild(element);

        expect(element.foo).to.equal('a');
        expect(element.bar).to.equal(1);

        element.foo = 'b';

        expect(element.foo).to.equal('b');
        expect(element.bar).to.equal(1);

        element.bar = 2;

        expect(element.foo).to.equal('b');
        expect(element.bar).to.equal(2);
    });

    it('should override default property value if attribute exists', () => {
        elementize(generateTestName(), {foo: 'bar'}, (element) => {
            expect(element.foo).to.equal('baz');
            expect(element.getAttribute('foo')).to.equal('baz');
        });

        const element = createHTMLTestElement({foo: 'baz'});

        expect(element.foo).to.equal(undefined);
        expect(element.getAttribute('foo')).to.equal('baz');

        container.appendChild(element);
        
        expect(element.foo).to.equal('baz');
        expect(element.getAttribute('foo')).to.equal('baz');
    });

    it('should convert a camel-cased property name into a kebab-case attribute name', () => {
        elementize(generateTestName(), {fooBarBaz: 'a'}, (element) => {
            expect(element.getAttribute('foo-bar-baz')).to.equal('a');
        });
    
        const element = createTestElement();
        container.appendChild(element);
        
        expect(element.getAttribute('foo-bar-baz')).to.equal('a');
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

    it('should not dispatch prop event if the value is the same', () => {
        elementize(generateTestName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(spy.callCount).to.equal(0);

        element.foo = 'baz';

        expect(spy.callCount).to.equal(1);

        element.foo = 'baz';

        expect(spy.callCount).to.equal(1);
    });

    it('should support specific prop event subscription', () => {
        elementize(generateTestName(), {foo: 'a', bar: 1}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const fooSpy = sinon.spy();
        const barSpy = sinon.spy();
        element.subscribe('prop:foo', fooSpy);
        element.subscribe('prop:bar', barSpy);

        expect(fooSpy.callCount).to.equal(0);
        expect(barSpy.callCount).to.equal(0);

        element.foo = 'b';

        expect(fooSpy.callCount).to.equal(1);
        expect(fooSpy.args[0][0]).to.equal('b');
        expect(fooSpy.args[0][1]).to.equal('a');
        expect(barSpy.callCount).to.equal(0);

        element.bar = 2;

        expect(barSpy.callCount).to.equal(1);
        expect(barSpy.args[0][0]).to.equal(2);
        expect(barSpy.args[0][1]).to.equal(1);
        expect(fooSpy.callCount).to.equal(1);
    });

    it('should support attr event subscription', () => {
        const spy = sinon.spy();
    
        elementize(generateTestName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('attr', spy);
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        expect(spy.callCount).to.equal(0);
    
        element.setAttribute('foo', 'baz');
    
        expect(element.getAttribute('foo')).to.equal('baz');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal('baz');
        expect(spy.args[0][2]).to.equal('bar');
    
        element.setAttribute('foo', 'qux');
    
        expect(element.getAttribute('foo')).to.equal('qux');
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('foo');
        expect(spy.args[1][1]).to.equal('qux');
        expect(spy.args[1][2]).to.equal('baz');
    });
    
    it('should support multiple prop event subscriptions', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elementize(generateTestName(), {foo: 'bar'}, (element, subscribe) => {
            subscribe('attr', spy1);
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        element.subscribe('attr', spy2);
    
        expect(spy1.callCount).to.equal(0);
        expect(spy2.callCount).to.equal(0);
    
        element.setAttribute('foo', 'baz');
    
        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal('foo');
        expect(spy1.args[0][1]).to.equal('baz');
        expect(spy1.args[0][2]).to.equal('bar');
    
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal('foo');
        expect(spy2.args[0][1]).to.equal('baz');
        expect(spy2.args[0][2]).to.equal('bar');
    
        element.setAttribute('foo', 'qux');
    
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
            subscribe('attr', spy1);
        });
    
        const element = createTestElement();
        container.appendChild(element);
        
        unsubscribe = element.subscribe('attr', spy2);
    
        element.setAttribute('foo', 'baz');
    
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
    
        element.setAttribute('foo', 'qux');
    
        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('foo');
        expect(spy1.args[1][1]).to.equal('qux');
        expect(spy1.args[1][2]).to.equal('baz');
    
        expect(spy2.callCount).to.equal(1);
    });

    it('should not dispatch attr event if the value is the same', () => {
        elementize(generateTestName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('attr', spy);

        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', 'baz');

        expect(spy.callCount).to.equal(1);

        element.setAttribute('foo', 'baz');

        expect(spy.callCount).to.equal(1);
    });

    it('should support specific prop event subscription', () => {
        elementize(generateTestName(), {foo: 'a', bar: '1'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const fooSpy = sinon.spy();
        const barSpy = sinon.spy();
        element.subscribe('attr:foo', fooSpy);
        element.subscribe('attr:bar', barSpy);

        expect(fooSpy.callCount).to.equal(0);
        expect(barSpy.callCount).to.equal(0);

        element.setAttribute('foo', 'b');

        expect(fooSpy.callCount).to.equal(1);
        expect(fooSpy.args[0][0]).to.equal('b');
        expect(fooSpy.args[0][1]).to.equal('a');
        expect(barSpy.callCount).to.equal(0);

        element.setAttribute('bar', '2');

        expect(barSpy.callCount).to.equal(1);
        expect(barSpy.args[0][0]).to.equal('2');
        expect(barSpy.args[0][1]).to.equal('1');
        expect(fooSpy.callCount).to.equal(1);
    });
});
