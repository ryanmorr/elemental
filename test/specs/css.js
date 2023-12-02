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

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(element.shadowRoot.firstChild, 'width')).to.equal('14px');
        expect(getStyle(container, 'width')).to.not.equal('14px');
    });

    it('should append CSS as a string', () => {
        elementize(generateTagName(), (element) => {
            element.css = `
                div {
                    width: 14px;
                }
            `;

            element.css = `
                div {
                    display: flex;
                }
            `;

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(element.shadowRoot.firstChild, 'width')).to.equal('14px');
        expect(getStyle(element.shadowRoot.firstChild, 'display')).to.equal('flex');
    });

    it('should support CSS as a sheet', () => {
        elementize(generateTagName(), (element) => {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(`
                div {
                    width: 23px;
                }
            `);

            element.css = sheet;

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(element.shadowRoot.firstChild, 'width')).to.equal('23px');
    });

    it('should append CSS as a sheet', () => {
        elementize(generateTagName(), (element) => {
            const sheet1 = new CSSStyleSheet();
            sheet1.replaceSync(`
                div {
                    width: 44px;
                }
            `);

            const sheet2 = new CSSStyleSheet();
            sheet2.replaceSync(`
                div {
                    display: inline;
                }
            `);

            element.css = sheet1;
            element.css = sheet2;

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(element.shadowRoot.firstChild, 'width')).to.equal('44px');
        expect(getStyle(element.shadowRoot.firstChild, 'display')).to.equal('inline');
    });
});
