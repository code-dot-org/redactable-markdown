const expect = require('expect');
const parser = require('../../src/cdoFlavoredParser');

describe('Standard Markdown', () => {
  it('redacts link urls', () => {
    const input = "This is some text with [a link](http://example.com)";
    const output = parser.sourceToRedacted(input);
    expect(output).toEqual("This is some text with [a link]\n");
  });

  it('redacts image urls', () => {
    const input = "This is some text with ![an image](http://example.com/img.jpg)";
    const output = parser.sourceToRedacted(input);
    expect(output).toEqual("This is some text with ![an image]\n");
  });

  it('can merge a source MDAST with a redacted MDAST', () => {
    const source = "This is some text with [a link](http://example.com/)";
    const redacted = "Ceci est un texte avec [un lien]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>Ceci est un texte avec <a href=\"http://example.com/\">un lien</a></p>\n");
  });

  it('can differentiate between multiple redacted links', () => {
    const source = "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
    const redacted = "C'est du texte avec [un lien] et ![une image].\n\nEt aussi un deuxième paragraphe avec [un autre lien]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>C'est du texte avec <a href=\"http://first.com\">un lien</a> et <img src=\"http://second.com/img.jpg\" alt=\"une image\">.</p>\n<p>Et aussi un deuxième paragraphe avec <a href=\"http://third.com\">un autre lien</a></p>\n");
  });

  it('if the redacted text removes a url, it will blindly merge however many urls there are', () => {
    const source = "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
    const redacted = "C'est du texte avec [un lien] et pas d'une image.\n\nEt aussi un deuxième paragraphe avec [un autre lien]";
    const output = parser.sourceAndRedactedToHtml(source, redacted);
    expect(output).toEqual("<p>C'est du texte avec <a href=\"http://first.com\">un lien</a> et pas d'une image.</p>\n<p>Et aussi un deuxième paragraphe avec <a href=\"http://second.com/img.jpg\">un autre lien</a></p>\n");
  });
});
