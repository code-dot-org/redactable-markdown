const expect = require('expect');
const parser = require('../../../src/cdoFlavoredParser');

describe('vocablink', () => {
  describe('render', () => {
    it('cannot render vocablinks to html', () => {
      const input = "[v some-word]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[v some-word]</p>\n");
    });
  });

  describe('redact', () => {
    it('redacts vocablinks', () => {
      const input = "[v some-word]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[some-word][0]\n");
    });

    it('redacts vocablinks with word overrides', () => {
      const input = "[v some-word][un-mot]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[un-mot][0]\n");
    });
  });

  describe('restore', () => {
    it('can restore vocablinks back to markdown', () => {
      const source = "[v some-word]";
      const redacted = "[un-mot][0]"
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[v some-word][un-mot]\n");
    });

    it('can restore vocablinks with word overrides back to markdown', () => {
      const source = "[v some-word][source-override]";
      const redacted = "[redaction-override][0]"
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[v some-word][redaction-override]\n");
    });
  });
});
