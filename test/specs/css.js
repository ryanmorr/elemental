import { container, generateTagName, getTagName, createTestElement, getStyle } from '../setup';
import elementize from '../../src/elementize';

describe('css', () => {
    it('should support scoped CSS as a string', () => {
        elementize(generateTagName(), (element) => {
            element.css = `
                div {
                    width: 14px;
                }
            `;

            return '<div>foo</div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(element.shadowRoot.firstChild, 'width')).to.equal('14px');
        expect(getStyle(container, 'width')).to.not.equal('14px');
    });
});
