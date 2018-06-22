const expect = require('expect');
const parser = require('../../../../src/cdoFlavoredParser');

describe('attrlist', () => {
  describe('render', () => {
    it('does not render basic attrlists', () => {
      const input = "A bunch of text followed by [a link](http://example.com){ .center } with more after it";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>A bunch of text followed by <a href=\"http://example.com\">a link</a>{ .center } with more after it</p>\n");
    });

    it('does not render basic image attrlists', () => {
      const input = "A bunch of text followed by ![an image](http://example.com){ .center } with more after it";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>A bunch of text followed by <img src=\"http://example.com\" alt=\"an image\">{ .center } with more after it</p>\n");
    });
  });

  describe('redact', () => {
    it('does not redact brackets in code', () => {
      const input = "A bunch of text with some random `[link](asdf)` with more after it";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual(input + "\n");
    });

    it('does not redact something that is just using a bracket in text', () => {
      const input = "A bunch of text with some random { brackets } with more after it";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual(input + "\n");
    });

    it('redacts attrlists', () => {
      const input = "A bunch of text followed by [a link](http://example.com){ .center } with more after it";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("A bunch of text followed by [a link][0] with more after it\n");
    });

    it('redacts image attrlists', () => {
      const input = "A bunch of text followed by ![an image](http://example.com){ .center } with more after it";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("A bunch of text followed by [an image][0] with more after it\n");
    });
  });

  describe('restore', () => {
    it('can restore attrlists back to markdown', () => {
      const source = "[a link](http://example.com){ .center }";
      const redacted = "[une linke][0]";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[une linke](http://example.com){ .center }\n");
    });
  });
});
