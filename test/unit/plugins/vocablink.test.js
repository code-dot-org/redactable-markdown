const expect = require('expect');
const parser = require('../../../src/cdoFlavoredParser');

describe('vocablink', () => {
  describe('render', () => {
    it('cannot render vocablinks to html', () => {
      const input = "[v some-slug]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[v some-slug]</p>\n");
    });
  });

  describe('redact', () => {
    it('redacts vocablinks', () => {
      const input = "[v some-slug]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n");
    });
  });

  describe('restore', () => {
    it('can restore vocablinks back to markdown', () => {
      const source = "[v some-slug]";
      const redacted = "[][0]"
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[v some-slug]\n");
    });

    it('can only restore vocablinks to HTML by rendering the raw syntax', () => {
      // see the comment on the plugin definition for more context as to why
      // this is true
      const source = "[v some-slug]";
      const redacted = "[][0]"
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>[v some-slug]</p>\n");
    });
  });
});
