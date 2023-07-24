import elementize from '../../src/elementize';

describe('elementize', () => {
    let index = 0;
    const generateTagName = () => `test-element-${++index}`;
    const getTagName = () => `test-element-${index}`;

    it('should create and register a custom element', () => {
        const callback = sinon.spy(function() {
            return document.createTextNode('foo');
        });

        const CustomElement = elementize(generateTagName(), callback);

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
        elementize(generateTagName(), () => {
            return '<div>foo</div>';
        });

        const element = document.createElement(getTagName());
        expect(element.shadowRoot.innerHTML).to.equal('<div>foo</div>');
    });

    it('should support not returning shadow content', () => {
        const spy = sinon.spy();
        elementize(generateTagName(), spy);

        const element = document.createElement(getTagName());
        expect(element.shadowRoot.innerHTML).to.equal('');
    });
});
