const expect = require('expect');
const parser = require('../../src/cdoFlavoredParser');

describe('Standard Markdown', () => {
  it('redacts link urls', () => {
    const input = "This is some text with [a link](http://example.com)";
    const output = parser.sourceToRedacted(input);
    expect(output).toEqual("This is some text with [a link][0]\n");
  });

  it('redacts image urls', () => {
    const input = "This is some text with ![an image](http://example.com/img.jpg)";
    const output = parser.sourceToRedacted(input);
    expect(output).toEqual("This is some text with [an image][0]\n");
  });

  it('can merge a source MDAST with a redacted MDAST', () => {
    const source = "This is some text with [a link](http://example.com/)";
    const redacted = "Ceci est un texte avec [un lien][0]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>Ceci est un texte avec <a href=\"http://example.com/\">un lien</a></p>\n");
  });

  it('can merge a source MDAST with a redacted MDAST', () => {
    const source = "This is some text with ![an image](http://example.com/img.jpg)";
    const redacted = "Ceci est un texte avec [une image][0]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>Ceci est un texte avec <img src=\"http://example.com/img.jpg\" alt=\"une image\"></p>\n");
  });

  it('can differentiate between multiple redacted links', () => {
    const source = "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
    const redacted = "C'est du texte avec [un lien][0] et [une image][1].\n\nEt aussi un deuxième paragraphe avec [un autre lien][2]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>C'est du texte avec <a href=\"http://first.com\">un lien</a> et <img src=\"http://second.com/img.jpg\" alt=\"une image\">.</p>\n<p>Et aussi un deuxième paragraphe avec <a href=\"http://third.com\">un autre lien</a></p>\n");
  });

  it('can handle reordering of redacted links', () => {
    const source = "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
    const redacted = "C'est du texte avec [un lien][0] et [une image][2].\n\nEt aussi un deuxième paragraphe avec [un autre lien][1]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>C'est du texte avec <a href=\"http://first.com\">un lien</a> et <a href=\"http://third.com\">une image</a>.</p>\n<p>Et aussi un deuxième paragraphe avec <img src=\"http://second.com/img.jpg\" alt=\"un autre lien\"></p>\n");
  });

  it('can handle removal of redacted links', () => {
    const source = "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
    const redacted = "C'est du texte avec [un lien][0] et pas d'une image.\n\nEt aussi un deuxième paragraphe avec [un autre lien][2]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>C'est du texte avec <a href=\"http://first.com\">un lien</a> et pas d'une image.</p>\n<p>Et aussi un deuxième paragraphe avec <a href=\"http://third.com\">un autre lien</a></p>\n");
  });
});

describe('Custom Markdown', () => {
  // this should maybe go in a plugin-specific test suite
  describe('tiplink', () => {
    const basicTipMarkdown = "tip!!!";
    const basicTipHtml = "<p class=\"tiplink tiplink-tip\"><a href=\"#tip_undefined\"><i class=\"fa fa-lightbulb-o\"></i></a></p>";

    const basicDiscussionMarkdown = "discussion!!!";
    const basicDiscussionHtml = "<p class=\"tiplink tiplink-discussion\"><a href=\"#discussion_undefined\"><i class=\"fa fa-comments\"></i></a></p>";

    const labeledTipMarkdown = "tip!!! tip-0";
    const labeledTipHtml = "<p class=\"tiplink tiplink-tip\"><a href=\"#tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i></a></p>";

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

    it('redacts tiplinks', () => {
      const input = "This is some text with an inline labeled tip: " + labeledTipMarkdown;
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("This is some text with an inline labeled tip: [][0]\n");
    });

    it('can translate tiplinks', () => {
      const source = "This is some text with an inline labeled tip: " + labeledTipMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>Ceci est un texte avec un " + labeledTipHtml + " inline labeled tip</p>\n");
    });

    it('redacts basic tiplinks', () => {
      const input = "This is some text with an inline labeled tip: " + basicTipMarkdown;
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("This is some text with an inline labeled tip: [][0]\n");
    });

    it('can translate basic tiplinks', () => {
      const source = "This is some text with an inline labeled tip: " + basicTipMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>Ceci est un texte avec un " + basicTipHtml + " inline labeled tip</p>\n");
    });

    it('redacts basic discussion links', () => {
      const input = "This is some text with an inline labeled tip: " + basicDiscussionMarkdown;
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("This is some text with an inline labeled tip: [][0]\n");
    });

    it('can translate basic discussion links', () => {
      const source = "This is some text with an inline labeled tip: " + basicDiscussionMarkdown;
      const redacted = "Ceci est un texte avec un [][0] inline labeled tip";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>Ceci est un texte avec un " + basicDiscussionHtml + " inline labeled tip</p>\n");
    });
  });
});
