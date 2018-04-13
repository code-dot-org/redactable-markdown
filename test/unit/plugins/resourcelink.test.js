const expect = require('expect');
const parser = require('../../../src/cdoFlavoredParser');

describe('resourcelink', () => {
  describe('render', () => {
    it('cannot render resourcelinks to html', () => {
      const input = "[r some-slug]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[r some-slug]</p>\n");
    });
  });

  describe('redact', () => {
    it('redacts resourcelinks', () => {
      const input = "[r some-slug]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n");
    });
  });

  describe('restore', () => {
    it('can restore resourcelinks back to markdown', () => {
      const source = "[r some-slug]";
      const redacted = "[][0]"
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[r some-slug]\n");
    });

    it('cannot resotre resourcelinks to html', () => {
      const source = "[r some-slug]";
      const redacted = "[][0]"
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>[r some-slug]</p>\n");
    });
  });
});
