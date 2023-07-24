import elementize from '../../src/elementize';

describe('elementize', () => {
    it('should create and register a custom element', () => {
        const callback = sinon.spy(function() {
            return document.createTextNode('foo');
        });

        const CustomElement1 = elementize('test-element1', callback);

        expect(CustomElement1).to.be.a('function');
        expect(callback.callCount).to.equal(0);

        const constructor = customElements.get('test-element1');
        expect(constructor).to.exist;
        expect(constructor).to.equal(CustomElement1);

        const element = document.createElement('test-element1');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(element);
        expect(callback.calledOn(element)).to.equal(true);

        expect(element.nodeType).to.equal(1);
        expect(element.tagName).to.equal('TEST-ELEMENT1');
        expect(element.shadowRoot.textContent).to.equal('foo');
        expect(element).to.be.an.instanceof(CustomElement1);
        expect(element).to.be.an.instanceof(HTMLElement);
    });

    it('should support shadow content as an HTML string', () => {
        elementize('test-element2', () => {
            return '<div>foo</div>';
        });

        const element = document.createElement('test-element2');
        expect(element.shadowRoot.innerHTML).to.equal('<div>foo</div>');
    });

    it('should support not returning shadow content', () => {
        const spy = sinon.spy();
        elementize('test-element3', spy);

        const element = document.createElement('test-element3');
        expect(element.shadowRoot.innerHTML).to.equal('');
    });
});
