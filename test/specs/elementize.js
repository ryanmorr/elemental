import elementize from '../../src/elementize';

describe('elementize', () => {
    it('should create and register a custom element', () => {
        const callback = sinon.spy(function() {
            return document.createTextNode('foo');
        });

        const CustomElement = elementize('test-element', callback);

        expect(CustomElement).to.be.a('function');
        expect(callback.callCount).to.equal(0);

        const constructor = customElements.get('test-element');
        expect(constructor).to.exist;
        expect(constructor).to.equal(CustomElement);

        const element = document.createElement('test-element');

        expect(callback.callCount).to.equal(1);
        expect(callback.args[0][0]).to.equal(element);
        expect(callback.calledOn(element)).to.equal(true);

        expect(element.nodeType).to.equal(1);
        expect(element.tagName).to.equal('TEST-ELEMENT');
        expect(element.shadowRoot.textContent).to.equal('foo');
        expect(element).to.be.an.instanceof(CustomElement);
        expect(element).to.be.an.instanceof(HTMLElement);
    });
});
