const expect = require("expect");
const processor = require("../../src/redactableMarkdownProcessor").create();

describe("Standard Markdown", () => {
  describe("render", () => {
    it("can render basic links", () => {
      const input = "This is some text with [a link](http://example.com)";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual(
        '<p>This is some text with <a href="http://example.com">a link</a></p>\n'
      );
    });

    it("can render autolinks", () => {
      const input =
        "This is some text that automatically links to <http://example.com>";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual(
        '<p>This is some text that automatically links to <a href="http://example.com">http://example.com</a></p>\n'
      );
    });

    it("can render sublists with tab characters", () => {
      const input =
        "- List item one.\n\n\t- Sublist item one\n\n\t- Sublist item two\n\n- List item two";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual(
        "<ul>\n<li>\n<p>List item one.</p>\n<ul>\n<li>\n<p>Sublist item one</p>\n</li>\n<li>\n<p>Sublist item two</p>\n</li>\n</ul>\n</li>\n<li>\n<p>List item two</p>\n</li>\n</ul>\n"
      );
    });

    it("can render complex nested lists", () => {
      const input =
        "1.  List item one.\n\n    List item one continued with a second paragraph followed by an\n    Indented block.\n\n        $ ls *.sh\n        $ mv *.sh ~/tmp\n\n    List item continued with a third paragraph.\n\n2.  List item two continued with an open block.\n\n    This paragraph is part of the preceding list item.\n\n    1. This list is nested and does not require explicit item continuation.\n\n       This paragraph is part of the preceding list item.\n\n    2. List item b.\n\n    This paragraph belongs to item two of the outer list.";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual(
        "<ol>\n<li>\n<p>List item one.</p>\n<p>List item one continued with a second paragraph followed by an\nIndented block.</p>\n<pre><code>$ ls *.sh\n$ mv *.sh ~/tmp\n</code></pre>\n<p>List item continued with a third paragraph.</p>\n</li>\n<li>\n<p>List item two continued with an open block.</p>\n<p>This paragraph is part of the preceding list item.</p>\n<ol>\n<li>\n<p>This list is nested and does not require explicit item continuation.</p>\n<p>This paragraph is part of the preceding list item.</p>\n</li>\n<li>\n<p>List item b.</p>\n</li>\n</ol>\n<p>This paragraph belongs to item two of the outer list.</p>\n</li>\n</ol>\n"
      );
    });
  });

  describe("redact", () => {
    it("redacts link urls", () => {
      const input = "This is some text with [a link](http://example.com)";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual("This is some text with [a link][0]\n");
    });

    it("redacts image urls", () => {
      const input =
        "This is some text with ![an image](http://example.com/img.jpg)";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual("This is some text with [an image][0]\n");
    });

    it("redacts autolinks", () => {
      const input =
        "This is some text that automatically links to <http://example.com>";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual(
        "This is some text that automatically links to [http://example.com][0]\n"
      );
    });
  });

  describe("restore", () => {
    it("can restore redacted links to markdown", () => {
      const source = "This is some text with [a link](http://example.com/)";
      const redacted = "Ceci est un texte avec [un lien][0]";
      const output = processor.sourceAndRedactedToRestored(source, redacted);
      expect(output).toEqual(
        "Ceci est un texte avec [un lien](http://example.com/)\n"
      );
    });

    it("can restore redacted autolinks", () => {
      const source =
        "This is some text that automatically links to <http://example.com>";
      const redacted =
        "C'est du texte that automatically links to [http://example.com][0]\n";
      const output = processor.sourceAndRedactedToRestored(source, redacted);
      expect(output).toEqual(
        "C'est du texte that automatically links to <http://example.com>\n"
      );
    });

    it("can restore redacted and altered autolinks", () => {
      const source =
        "This is some text that automatically links to <http://example.com>";
      const redacted = "C'est du texte that links to [this example][0]\n";
      const output = processor.sourceAndRedactedToRestored(source, redacted);
      expect(output).toEqual(
        "C'est du texte that links to [this example](http://example.com)\n"
      );
    });

    it("can restore redacted links to html", () => {
      const source = "This is some text with [a link](http://example.com/)";
      const redacted = "Ceci est un texte avec [un lien][0]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual(
        '<p>Ceci est un texte avec <a href="http://example.com/">un lien</a></p>\n'
      );
    });

    it("can restore redacted images", () => {
      const source =
        "This is some text with ![an image](http://example.com/img.jpg)";
      const redacted = "Ceci est un texte avec [une image][0]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual(
        '<p>Ceci est un texte avec <img src="http://example.com/img.jpg" alt="une image"></p>\n'
      );
    });

    it("can differentiate between multiple redactons", () => {
      const source =
        "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
      const redacted =
        "C'est du texte avec [un lien][0] et [une image][1].\n\nEt aussi un deuxième paragraphe avec [un autre lien][2]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual(
        '<p>C\'est du texte avec <a href="http://first.com">un lien</a> et <img src="http://second.com/img.jpg" alt="une image">.</p>\n<p>Et aussi un deuxième paragraphe avec <a href="http://third.com">un autre lien</a></p>\n'
      );
    });

    it("can handle reordering of redactions", () => {
      const source = "The [black](http://first.com) [cat](http://second.com).";
      const redacted = "Le [chat][1] [noir][0].";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual(
        '<p>Le <a href="http://second.com">chat</a> <a href="http://first.com">noir</a>.</p>\n'
      );
    });

    it("can handle removal of redactions", () => {
      const source =
        "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";
      const redacted =
        "C'est du texte avec [un lien][0] et pas d'une image.\n\nEt aussi un deuxième paragraphe avec [un autre lien][2]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual(
        '<p>C\'est du texte avec <a href="http://first.com">un lien</a> et pas d\'une image.</p>\n<p>Et aussi un deuxième paragraphe avec <a href="http://third.com">un autre lien</a></p>\n'
      );
    });

    it("will handle extra/unwanted redactions by treating them as references without definitions", () => {
      const source = "This is some text with [a link](http://example.com/)";
      const redacted = "C'est du texte avec [un lien][0] et [une image][1]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual(
        '<p>C\'est du texte avec <a href="http://example.com/">un lien</a> et [une image][1]</p>\n'
      );
    });

    it("will handle extra/unwanted redactions by rejecting them with flag set", () => {
      const source = "This is some text with [a link](http://example.com/)";
      const redacted = "C'est du texte avec [un lien][0] et [une image][1]";
      const output = processor.sourceAndRedactedToHtml(source, redacted, true);
      expect(output).toEqual("");
    });

    it("will handle removed redactions by rejecting them with flag set", () => {
      const source = "This is some text with [a link](http://example.com/)";
      const redacted = "C'est du texte avec ";
      const output = processor.sourceAndRedactedToHtml(source, redacted, true);
      expect(output).toEqual("");
    });
  });
});
