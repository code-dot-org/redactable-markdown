const expect = require('expect');
const parser = require('../../../../src/redactableMarkdownParser').create();

describe('paragraph', () => {
  describe('render', () => {
    it('renders paragraphs separated by < 4 spaces as two paragraphs', () => {
      for (let i = 0; i < 4; i++) {
        const input = `First Paragraph\n${' '.repeat(i)}\nSecondParagraph`
        const output = parser.sourceToHtml(input);
        expect(output).toEqual("<p>First Paragraph</p>\n<p>SecondParagraph</p>\n");
      }
    });
    it('renders paragraphs separated by >= 4 spaces as two paragraphs', () => {
      for (let i = 4; i < 20; i++) {
        const input = `First Paragraph\n${' '.repeat(i)}\nSecondParagraph`
        const output = parser.sourceToHtml(input);
        expect(output).toEqual("<p>First Paragraph</p>\n<p>SecondParagraph</p>\n");
      }
    });
  });
});
