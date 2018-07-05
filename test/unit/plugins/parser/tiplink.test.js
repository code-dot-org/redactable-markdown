const expect = require('expect');
const parser = require('../../../../src/redactableMarkdownParser').create();
const tiplinkPlugin = require('./tiplink');
parser.parser.use(tiplinkPlugin);

describe('tiplink', () => {
  const basicTipMarkdown = "tip!!!";
  const basicTipHtml = "<p class=\"tiplink tiplink-tip\"><a href=\"#tip_undefined\"><i class=\"fa fa-lightbulb-o\"></i></a></p>";

  const basicDiscussionMarkdown = "discussion!!!";
  const basicDiscussionHtml = "<p class=\"tiplink tiplink-discussion\"><a href=\"#discussion_undefined\"><i class=\"fa fa-comments\"></i></a></p>";

  const labeledTipMarkdown = "tip!!! tip-0";
  const labeledTipHtml = "<p class=\"tiplink tiplink-tip\"><a href=\"#tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i></a></p>";

  describe('render', () => {
    it('renders basic tiplink', () => {
      const input = basicTipMarkdown;
      const output = parser.sourceToHtml(input);
      expect(output).toEqual(`<p>${basicTipHtml}</p>\n`);
    });

    it('renders a tiplink no matter where it begins', () => {
      const input = `look, a ${basicTipMarkdown}`;
      const output = parser.sourceToHtml(input);
      expect(output).toEqual(`<p>look, a ${basicTipHtml}</p>\n`);
    });

    it('renders tiplink with label', () => {
      const input = labeledTipMarkdown;
      const output = parser.sourceToHtml(input);
      expect(output).toEqual(`<p>${labeledTipHtml}</p>\n`);
    });

    it('renders a tiplink with label no matter where it begins', () => {
      const input = `look, a ${labeledTipMarkdown}`;
      const output = parser.sourceToHtml(input);
      expect(output).toEqual(`<p>look, a ${labeledTipHtml}</p>\n`);
    });

    it('renders a tiplink with label with content after it', () => {
      const input = `look, a ${labeledTipMarkdown} cool, huh?`;
      const output = parser.sourceToHtml(input);
      expect(output).toEqual(`<p>look, a ${labeledTipHtml} cool, huh?</p>\n`);
    });
  });

  describe('redact', () => {
    it('redacts tiplinks', () => {
      const input = "This is some text with an inline labeled tip: " + labeledTipMarkdown;
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("This is some text with an inline labeled tip: [][0]\n");
    });

    it('redacts basic tiplinks', () => {
      const input = "This is some text with an inline labeled tip: " + basicTipMarkdown;
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("This is some text with an inline labeled tip: [][0]\n");
    });

    it('redacts basic discussion links', () => {
      const input = "This is some text with an inline labeled tip: " + basicDiscussionMarkdown;
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("This is some text with an inline labeled tip: [][0]\n");
    });
  });

  describe('restore', () => {
    it('can restore tiplinks back to markdown', () => {
      const source = "This is some text with an inline labeled tip: " + labeledTipMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("Ceci est un texte avec un tip!!! tip-0 inline labeled tip\n");
    });

    it('can translate tiplinks', () => {
      const source = "This is some text with an inline labeled tip: " + labeledTipMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>Ceci est un texte avec un " + labeledTipHtml + " inline labeled tip</p>\n");
    });

    it('can translate basic tiplinks', () => {
      const source = "This is some text with an inline labeled tip: " + basicTipMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>Ceci est un texte avec un " + basicTipHtml + " inline labeled tip</p>\n");
    });

    it('can translate basic discussion links', () => {
      const source = "This is some text with an inline labeled tip: " + basicDiscussionMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>Ceci est un texte avec un " + basicDiscussionHtml + " inline labeled tip</p>\n");
    });
  });
});
