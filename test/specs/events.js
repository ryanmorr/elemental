import { container, generateTagName, createTestElement } from '../setup';
import elemental from '../../src/elemental';

describe('events', () => {
    it('should support mount event observers', () => {
        const spy = sinon.spy();

        elemental(generateTagName(), (element) => {
            element.observe('mount', spy);
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

    it('should support multiple mount event observers', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), (element) => {
            element.observe('mount', spy1);
        });

        const element = createTestElement();

        expect(element.observe).to.be.a('function');
        element.observe('mount', spy2);

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

    it('should support removing a mount event observer', () => {
        let unobserve;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), (element) => {
            unobserve = element.observe('mount', spy1);
        });

        const element = createTestElement();

        element.observe('mount', spy2);

        document.body.appendChild(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(1);

        element.remove();

        expect(unobserve).to.be.a('function');
        unobserve();

        container.appendChild(element);

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(2);
    });

    it('should support unmount event observer', () => {
        const spy = sinon.spy();

        elemental(generateTagName(), (element) => {
            element.observe('unmount', spy);
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

    it('should support multiple mount event observers', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), (element) => {
            element.observe('unmount', spy1);
        });

        const element = createTestElement();

        element.observe('unmount', spy2);

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

    it('should support removing a mount event observer', () => {
        let unobserve;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), (element) => {
            element.observe('unmount', spy1);
        });

        const element = createTestElement();
        
        unobserve = element.observe('unmount', spy2);

        document.body.appendChild(element);

        element.remove();

        expect(spy1.callCount).to.equal(1);
        expect(spy2.callCount).to.equal(1);

        container.appendChild(element);

        expect(unobserve).to.be.a('function');
        unobserve();

        element.remove();

        expect(spy1.callCount).to.equal(2);
        expect(spy2.callCount).to.equal(1);
    });

    it('should support prop event observer', () => {
        const spy = sinon.spy();

        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            element.observe('prop', spy);
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

    it('should support multiple prop event observers', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            element.observe('prop', spy1);
        });

        const element = createTestElement();
        container.appendChild(element);

        element.observe('prop', spy2);

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

    it('should support removing a prop event observer', () => {
        let unobserve;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            element.observe('prop', spy1);
        });

        const element = createTestElement();
        container.appendChild(element);
        
        unobserve = element.observe('prop', spy2);

        element.foo = 'baz';

        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal('foo');
        expect(spy1.args[0][1]).to.equal('baz');
        expect(spy1.args[0][2]).to.equal('bar');

        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal('foo');
        expect(spy2.args[0][1]).to.equal('baz');
        expect(spy2.args[0][2]).to.equal('bar');

        expect(unobserve).to.be.a('function');
        unobserve();

        element.foo = 'qux';

        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('foo');
        expect(spy1.args[1][1]).to.equal('qux');
        expect(spy1.args[1][2]).to.equal('baz');

        expect(spy2.callCount).to.equal(1);
    });

    it('should dispatch prop event if a property is changed within the constructor function', (done) => {
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            const spy = sinon.spy();
            element.observe('prop', spy);

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
        elemental(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.observe('prop', spy);

        expect(spy.callCount).to.equal(0);

        element.foo = 'baz';

        expect(spy.callCount).to.equal(1);

        element.foo = 'baz';

        expect(spy.callCount).to.equal(1);

        element.foo = 'bar';

        expect(spy.callCount).to.equal(2);

        element.foo = 'bar';

        expect(spy.callCount).to.equal(2);

        element.foo = 'qux';

        expect(spy.callCount).to.equal(3);
    });

    it('should support specific prop event observer', () => {
        elemental(generateTagName(), {foo: 'a', bar: 1}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const fooSpy = sinon.spy();
        const barSpy = sinon.spy();
        element.observe('prop:foo', fooSpy);
        element.observe('prop:bar', barSpy);

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

    it('should support attr event observer', () => {
        const spy = sinon.spy();
    
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            element.observe('attr', spy);
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
    
    it('should support multiple prop event observers', () => {
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            element.observe('attr', spy1);
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        element.observe('attr', spy2);
    
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
    
    it('should support removing a prop event observer', () => {
        let unobserve;
        const spy1 = sinon.spy();
        const spy2 = sinon.spy();
        
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            element.observe('attr', spy1);
        });
    
        const element = createTestElement();
        container.appendChild(element);
        
        unobserve = element.observe('attr', spy2);
    
        element.setAttribute('foo', 'baz');
    
        expect(spy1.callCount).to.equal(1);
        expect(spy1.args[0][0]).to.equal('foo');
        expect(spy1.args[0][1]).to.equal('baz');
        expect(spy1.args[0][2]).to.equal('bar');
    
        expect(spy2.callCount).to.equal(1);
        expect(spy2.args[0][0]).to.equal('foo');
        expect(spy2.args[0][1]).to.equal('baz');
        expect(spy2.args[0][2]).to.equal('bar');
    
        expect(unobserve).to.be.a('function');
        unobserve();
    
        element.setAttribute('foo', 'qux');
    
        expect(spy1.callCount).to.equal(2);
        expect(spy1.args[1][0]).to.equal('foo');
        expect(spy1.args[1][1]).to.equal('qux');
        expect(spy1.args[1][2]).to.equal('baz');
    
        expect(spy2.callCount).to.equal(1);
    });

    it('should dispatch attr event if an attribute is changed within the constructor function', (done) => {    
        elemental(generateTagName(), {foo: 'bar'}, (element) => {
            const spy = sinon.spy();
            element.observe('attr', spy);

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
        elemental(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.observe('attr', spy);

        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', 'baz');

        expect(spy.callCount).to.equal(1);

        element.setAttribute('foo', 'baz');

        expect(spy.callCount).to.equal(1);
    });

    it('should support specific prop event observer', () => {
        elemental(generateTagName(), {foo: 'a', bar: '1'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const fooSpy = sinon.spy();
        const barSpy = sinon.spy();
        element.observe('attr:foo', fooSpy);
        element.observe('attr:bar', barSpy);

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
