import { container, generateTagName, createTestElement } from '../setup';
import elementize from '../../src/elementize';

describe('html', () => {
    it('should return shadow root', () => {
        elementize(generateTagName(), () => {
            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.html).to.equal(element.shadowRoot);
        expect(element.html.innerHTML).to.equal('<div></div>');
    });

    it('should set shadow root content with an HTML string', () => {
        elementize(generateTagName(), (element) => {
            element.html = '<span></span>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('<span></span>');
    });

    it('should set shadow root content with a DOM node', () => {
        elementize(generateTagName(), (element) => {
            element.html = document.createElement('section');
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(element.shadowRoot.innerHTML).to.equal('<section></section>');
    });

    it('should clear previous HTML when setting content', () => {
        elementize(generateTagName(), (element) => {
            element.html = '<em></em>';

            expect(element.html.innerHTML).to.equal('<em></em>');

            element.html = document.createElement('span');

            expect(element.html.innerHTML).to.equal('<span></span>');

            element.html = '<div></div>';

            expect(element.html.innerHTML).to.equal('<div></div>');

            element.html = document.createElement('section');

            expect(element.html.innerHTML).to.equal('<section></section>');
        });

        const element = createTestElement();

        container.appendChild(element);
    });
});
