import { container, generateTagName, createTestElement, createHTMLTestElement } from '../setup';
import elementize from '../../src/elementize';

describe('props', () => {
    it('should support default properties definition', () => {
        elementize(generateTagName(), {foo: 'bar', baz: 10}, (element) => {
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
        elementize(generateTagName(), {foo: 1, bar: 2, baz: 3, qux: 4}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);
        
        const props = Object.keys(element);

        expect(props).to.include('foo');
        expect(props).to.include('bar');
        expect(props).to.include('baz');
        expect(props).to.include('qux');
    });

    it('should be able to delete a property', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        delete element.foo;

        expect(element.foo).to.equal(undefined);
    });

    it('should update multiple properties', () => {
        elementize(generateTagName(), {foo: 'a', bar: 1}, () => 'foo');

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

    it('should clone default properties for each element instance', () => {
        elementize(generateTagName(), {foo: [1, 2, 3]}, () => 'foo');

        const element1 = createTestElement();
        const element2 = createTestElement();

        container.appendChild(element1);
        container.appendChild(element2);

        element1.foo.push(4);

        expect(element1.foo).to.deep.equal([1, 2, 3, 4]);
        expect(element2.foo).to.deep.equal([1, 2, 3]);
    });

    it('should reflect default properties to attributes', () => {
        elementize(generateTagName(), {foo: true, bar: 123, baz: 'abc'}, (element) => {
            expect(element.getAttribute('foo')).to.equal('');
            expect(element.getAttribute('bar')).to.equal('123');
            expect(element.getAttribute('baz')).to.equal('abc');
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        expect(element.getAttribute('foo')).to.equal('');
        expect(element.getAttribute('bar')).to.equal('123');
        expect(element.getAttribute('baz')).to.equal('abc');
    });

    it('should reflect falsy default properties to attributes', () => {
        elementize(generateTagName(), {foo: '', bar: 0}, (element) => {
            expect(element.getAttribute('foo')).to.equal('');
            expect(element.getAttribute('bar')).to.equal('0');
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        expect(element.getAttribute('foo')).to.equal('');
        expect(element.getAttribute('bar')).to.equal('0');
    });

    it('should not reflect default properties to attributes if the value is a non-primitive', () => {
        elementize(generateTagName(), {foo: [], bar: {}, baz: null}, (element) => {
            expect(element.hasAttribute('foo')).to.equal(false);
            expect(element.hasAttribute('bar')).to.equal(false);
            expect(element.hasAttribute('baz')).to.equal(false);
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        expect(element.hasAttribute('foo')).to.equal(false);
        expect(element.hasAttribute('bar')).to.equal(false);
        expect(element.hasAttribute('baz')).to.equal(false);
    });

    it('should not reflect default properties to attributes if the value is boolean false', () => {
        elementize(generateTagName(), {foo: false}, (element) => {
            expect(element.hasAttribute('foo')).to.equal(false);
        });
    
        const element = createTestElement();
        container.appendChild(element);
    
        expect(element.hasAttribute('foo')).to.equal(false);
    });

    it('should override default property value if attribute exists', () => {
        elementize(generateTagName(), {foo: 'bar'}, (element) => {
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
        elementize(generateTagName(), {fooBarBaz: 'a'}, (element) => {
            expect(element.getAttribute('foo-bar-baz')).to.equal('a');
        });
    
        const element = createTestElement();
        container.appendChild(element);
        
        expect(element.getAttribute('foo-bar-baz')).to.equal('a');
    });

    it('should reflect attributes to properties on change', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(element.foo).to.equal('bar');
        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', 'baz');

        expect(element.foo).to.equal('baz');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal('baz');
        expect(spy.args[0][2]).to.equal('bar');
    });

    it('should set a property to null if the reflected attribute was removed', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(spy.callCount).to.equal(0);

        element.removeAttribute('foo');

        expect(element.foo).to.equal(null);
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal(null);
        expect(spy.args[0][2]).to.equal('bar');
    });

    it('should reflect kebab-case attributes to camel-case properties on change', () => {
        elementize(generateTagName(), {fooBarBaz: 'a'}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(element.fooBarBaz).to.equal('a');
        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo-bar-baz', 'b');

        expect(element.fooBarBaz).to.equal('b');
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('fooBarBaz');
        expect(spy.args[0][1]).to.equal('b');
        expect(spy.args[0][2]).to.equal('a');
    }); 

    it('should not reflect properties to attributes on change', () => {
        elementize(generateTagName(), {foo: 'bar'}, () => 'foo');

        const element = createHTMLTestElement({foo: 'baz'});
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('attr', spy);

        expect(element.getAttribute('foo')).to.equal('baz');
        expect(spy.callCount).to.equal(0);

        element.foo = 'qux';

        expect(element.getAttribute('foo')).to.equal('baz');
        expect(spy.callCount).to.equal(0);
    });

    it('should parse a JSON string when reflecting an attribute to a property on initialization', () => {
        elementize(generateTagName(), {foo: null, bar: null}, () => 'foo');

        const element = createHTMLTestElement({
            foo: JSON.stringify({a: 1, b: 2, c: 3}),
            bar: JSON.stringify(['x', 'y', 'z'])
        });

        container.appendChild(element);

        expect(element.foo).to.deep.equal({a: 1, b: 2, c: 3});
        expect(element.bar).to.deep.equal(['x', 'y', 'z']);
    });

    it('should convert an empty string to a boolean true when reflecting an attribute to a property on initialization', () => {
        elementize(generateTagName(), {foo: null}, () => 'foo');

        const element = createHTMLTestElement({foo: ''});
        container.appendChild(element);

        expect(element.foo).to.equal(true);
    });

    it('should convert a numeric string to a number when reflecting an attribute to a property on initialization', () => {
        elementize(generateTagName(), {foo: null, bar: null}, () => 'foo');

        const element = createHTMLTestElement({foo: '22', bar: '75.29'});
        container.appendChild(element);

        expect(element.foo).to.equal(22);
        expect(element.bar).to.equal(75.29);
    });

    it('should parse a JSON string when reflecting an attribute to a property on change', () => {
        elementize(generateTagName(), {foo: null, bar: null}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(element.foo).to.equal(null);
        expect(element.bar).to.equal(null);
        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', JSON.stringify({a: 1, b: 2, c: 3}));

        expect(element.foo).to.deep.equal({a: 1, b: 2, c: 3});
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.deep.equal({a: 1, b: 2, c: 3});
        expect(spy.args[0][2]).to.equal(null);

        element.setAttribute('bar', JSON.stringify(['x', 'y', 'z']));

        expect(element.bar).to.deep.equal(['x', 'y', 'z']);
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('bar');
        expect(spy.args[1][1]).to.deep.equal(['x', 'y', 'z']);
        expect(spy.args[1][2]).to.equal(null);
    });

    it('should convert an empty string to a boolean true when reflecting an attribute to a property on change', () => {
        elementize(generateTagName(), {foo: null}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(element.foo).to.equal(null);
        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', '');

        expect(element.foo).to.equal(true);
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal(true);
        expect(spy.args[0][2]).to.equal(null);
    });

    it('should convert a numeric string to a number when reflecting an attribute to a property on change', () => {
        elementize(generateTagName(), {foo: null, bar: null}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('prop', spy);

        expect(element.foo).to.equal(null);
        expect(element.bar).to.equal(null);
        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', '13');

        expect(element.foo).to.equal(13);
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal('foo');
        expect(spy.args[0][1]).to.equal(13);
        expect(spy.args[0][2]).to.equal(null);

        element.setAttribute('bar', '81.353');

        expect(element.bar).to.equal(81.353);
        expect(spy.callCount).to.equal(2);
        expect(spy.args[1][0]).to.equal('bar');
        expect(spy.args[1][1]).to.equal(81.353);
        expect(spy.args[1][2]).to.equal(null);
    });

    it('should not observe attributes if the reflected default properties are a non-primitive', () => {
        elementize(generateTagName(), {foo: []}, () => 'foo');

        const element = createTestElement();
        container.appendChild(element);

        const spy = sinon.spy();
        element.subscribe('attr', spy);

        expect(spy.callCount).to.equal(0);

        element.setAttribute('foo', 'bar');

        expect(spy.callCount).to.equal(0);
    });
});
