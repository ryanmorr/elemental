import { container, generateTagName, createTestElement } from '../setup';
import elementize from '../../src/elementize';

describe('events', () => {
    it('should support mount event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), (element) => {
            element.subscribe('mount', spy);
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
        
        elementize(generateTagName(), (element) => {
            element.subscribe('mount', spy1);
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
        
        elementize(generateTagName(), (element) => {
            unsubscribe = element.subscribe('mount', spy1);
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

        elementize(generateTagName(), (element) => {
            element.subscribe('unmount', spy);
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
        
        elementize(generateTagName(), (element) => {
            element.subscribe('unmount', spy1);
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
        
        elementize(generateTagName(), (element) => {
            element.subscribe('unmount', spy1);
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

    it('should support prop event subscription', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            element.subscribe('prop', spy);
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
        
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            element.subscribe('prop', spy1);
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
        
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            element.subscribe('prop', spy1);
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

    it('should dispatch prop event if a property is changed within the constructor function', (done) => {
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            const spy = sinon.spy();
            element.subscribe('prop', spy);

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

            done();
        });

        const element = createTestElement();
        container.appendChild(element);
    });

    it('should not dispatch prop event if the value is the same', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

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
        elementize(generateTagName(), {foo: 'a', bar: 1}, () => 'foo');

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
    
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            element.subscribe('attr', spy);
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
        
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            element.subscribe('attr', spy1);
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
        
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            element.subscribe('attr', spy1);
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

    it('should dispatch attr event if an attribute is changed within the constructor function', (done) => {    
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
            const spy = sinon.spy();
            element.subscribe('attr', spy);

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

            done();
        });
    
        const element = createTestElement();
        container.appendChild(element);
    });

    it('should not dispatch attr event if the value is the same', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

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
        elementize(generateTagName(), {foo: 'a', bar: '1'}, () => 'foo');

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
