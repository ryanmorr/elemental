import { container, generateTagName, getTagName, createTestElement } from '../setup';
import elementize from '../../src/elementize';

describe('elementize', () => {
    it('should register and create a custom element', () => {
        const spy = sinon.spy();

        const CustomElement = elementize(generateTagName(), {}, spy);

        expect(CustomElement).to.be.a('function');
        expect(spy.callCount).to.equal(0);

        const constructor = customElements.get(getTagName());
        expect(constructor).to.exist;
        expect(constructor).to.equal(CustomElement);

        const element = createTestElement();

        expect(spy.callCount).to.equal(0);

        container.appendChild(element);

        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0]).to.equal(element);
        expect(spy.calledOn(element)).to.equal(true);

        expect(element.nodeType).to.equal(1);
        expect(element.localName).to.equal(getTagName());
        expect(element).to.be.an.instanceof(CustomElement);
        expect(element).to.be.an.instanceof(HTMLElement);
    });

    it('should not invoke the initialization function twice', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), {}, spy);

        expect(spy.callCount).to.equal(0);

        const element = createTestElement();

        container.appendChild(element);

        expect(spy.callCount).to.equal(1);

        element.remove();

        document.body.appendChild(element);

        expect(spy.callCount).to.equal(1);
    });

    it('should support optional default properties', () => {
        const spy = sinon.spy();

        elementize(generateTagName(), spy);

        expect(spy.callCount).to.equal(0);

        const element = createTestElement();

        container.appendChild(element);

        expect(spy.callCount).to.equal(1);
        expect(container.firstChild.localName).to.equal(getTagName());
    }); 

    it('should support returning shadow content as a DOM node', () => {
        elementize(generateTagName(), () => {
            return document.createTextNode('foo');
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('foo');
    });

    it('should support returning shadow content as a string', () => {
        elementize(generateTagName(), () => {
            return 'foo';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('foo');
    });

    it('should support returning shadow content as an HTML string', () => {
        elementize(generateTagName(), () => {
            return '<div>foo</div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('<div>foo</div>');
    });
});
