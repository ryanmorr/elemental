import { container, generateTagName, createTestElement, queryShadowRoot, getStyle } from '../setup';
import elemental from '../../src/elemental';

describe('css', () => {
    it('should support scoped CSS as a string', () => {
        elemental(generateTagName(), (element) => {
            element.css = `
                div {
                    width: 14px;
                }
            `;

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(queryShadowRoot('div'), 'width')).to.equal('14px');
        expect(getStyle(container, 'width')).to.not.equal('14px');
    });

    it('should support CSS as a sheet', () => {
        elemental(generateTagName(), (element) => {
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

        expect(getStyle(queryShadowRoot('div'), 'width')).to.equal('23px');
        expect(getStyle(container, 'width')).to.not.equal('23px');
    });

    it('should support CSS as a style element', () => {
        elemental(generateTagName(), (element) => {
            const style = document.createElement('style');
            style.textContent = `
                div {
                    width: 51px;
                }
            `;

            element.css = style;

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(queryShadowRoot('div'), 'width')).to.equal('51px');
        expect(getStyle(container, 'width')).to.not.equal('51px');
    });

    it('should support style element in the shadow root', () => {
        elemental(generateTagName(), () => {
            return `
                <style>
                div {
                    width: 35px;
                }
                </style>
                <div></div>
            `;
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(queryShadowRoot('div'), 'width')).to.equal('35px');
        expect(getStyle(container, 'width')).to.not.equal('35px');
    });

    it('should not append style element to shadow root if assigned to css property', () => {
        elemental(generateTagName(), (element) => {
            const style = document.createElement('style');
            style.textContent = `
                div {
                    width: 22px;
                }
            `;

            element.css = style;

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        expect(getStyle(queryShadowRoot('div'), 'width')).to.equal('22px');
        expect(element.html.innerHTML).to.equal('<div></div>');
    });

    it('should support CSS with an array of styles', () => {
        elemental(generateTagName(), (element) => {
            const string = `
                div {
                    width: 27px;
                }
            `;

            const style = document.createElement('style');
            style.textContent = `
                div {
                    padding: 42px;
                }
            `;

            const sheet = new CSSStyleSheet();
            sheet.replaceSync(`
                div {
                    margin: 13px
                }
            `);

            element.css = [string, style, sheet];

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        const div = queryShadowRoot('div');
        expect(getStyle(div, 'width')).to.equal('27px');
        expect(getStyle(div, 'padding')).to.equal('42px');
        expect(getStyle(div, 'margin')).to.equal('13px');
    });

    it('should append and not overwrite CSS with each assignment', () => {
        elemental(generateTagName(), (element) => {
            element.css = `
                div {
                    width: 55px;
                }
            `;

            const style = document.createElement('style');
            style.textContent = `
                div {
                    padding: 4px;
                }
            `;

            element.css = style;

            const sheet = new CSSStyleSheet();
            sheet.replaceSync(`
                div {
                    margin: 19px
                }
            `);

            element.css = [sheet];

            return '<div></div>';
        });

        const element = createTestElement();

        container.appendChild(element);

        const div = queryShadowRoot('div');
        expect(getStyle(div, 'width')).to.equal('55px');
        expect(getStyle(div, 'padding')).to.equal('4px');
        expect(getStyle(div, 'margin')).to.equal('19px');
    });
});
