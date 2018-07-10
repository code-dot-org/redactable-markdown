const expect = require('expect');
const parser = require('../../../../src/redactableMarkdownParser').create();

describe('divclass', () => {
  describe('render', () => {
    it('renders a basic divclass', () => {
      const input = "[col-33]\n\nsimple content\n\n[/col-33]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"col-33\"><p>simple content</p></div>\n");
    });

    it('renders a basic divclass even with a bunch of extra whitespace', () => {
      const input = "[col-33]   \n \nsimple content\n  \n     [/col-33]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"col-33\"><p>simple content</p></div>\n");
    });

    it('works without content - but only if separated by FOUR newlines', () => {
      const validInput = "[empty]\n\n\n\n[/empty]";
      expect(parser.sourceToHtml(validInput)).toEqual("<div class=\"empty\"></div>\n");
      const invalidInput = "[empty]\n\n[/empty]";
      expect(parser.sourceToHtml(invalidInput)).toEqual("<p>[empty]</p>\n<p>[/empty]</p>\n");
    });

    it('renders a divclass within other content', () => {
      const input = "outside of div\n\n[divname]\n\ninside div\n\n[/divname]\n\nmore outside";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>outside of div</p>\n<div class=\"divname\"><p>inside div</p></div>\n<p>more outside</p>\n");
    });

    it("doesn't care about duplicate classes", () => {
      const input = "[classname]\n\nfirst\n\n[/classname]\n\n[classname]\n\nsecond\n\n[/classname]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"classname\"><p>first</p></div>\n<div class=\"classname\"><p>second</p></div>\n");
    });

    it('can nest divclasses', () => {
      const input = "[outer]\n\n[inner]\n\nnested\n\n[/inner]\n\n[/outer]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"outer\"><div class=\"inner\"><p>nested</p></div></div>\n");
    });

    it('can nest duplicate divclasses', () => {
      const input = "[classname]\n\ncontent\n\n[classname]\n\ninner content\n\n[/classname]\n\ncontent\n\n[/classname]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"classname\"><p>content</p><div class=\"classname\"><p>inner content</p></div><p>content</p></div>\n");
    });

    it('can nest as deeply as you want', () => {
      const markdownOpen = "[classname]\n\n";
      const markdownClose = "\n\n[/classname]";
      const markdownContent = "content";
      const htmlOpen = "<div class=\"classname\">"
      const htmlClose = "</div>";
      const htmlContent = "<p>content</p>";

      let input = markdownContent;
      let output = htmlContent;
      for (let _ = 0; _ < 20; _++) {
        input = `${markdownOpen}${input}${markdownClose}`;
        output = `${htmlOpen}${output}${htmlClose}`;
        expect(parser.sourceToHtml(input)).toEqual(output + "\n");
      }
    });

    it('requires class-specific termination', () => {
      const input = "[example]\n\nsimple content\n\n[/]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[example]</p>\n<p>simple content</p>\n<p>[/]</p>\n");
    });

    it('requires divclasses be in their own paragraphs', () => {
      const input = "[example]simple content[/example]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[example]simple content[/example]</p>\n");
    });

    it('will not unindent', () => {
      const input = "[example]\n\n    simple content\n\n[/example]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"example\"><pre><code>simple content\n</code></pre></div>\n");
    });

    it('can render complex content inside a divclass', () => {
      const input = "[complex-example]\n\n-   an ordered list\n-   with **inline** _formatting_, too\n\n[/complex-example]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"complex-example\"><ul>\n<li>an ordered list</li>\n<li>with <strong>inline</strong> <em>formatting</em>, too</li>\n</ul></div>\n");
    });
  });

  describe('redact', () => {
    it('redacts a basic divclass', () => {
      const input = "[col-33]\n\nsimple content\n\n[/col-33]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n\nsimple content\n\n[/][0]\n");
    });

    it('works without content - but only if separated by FOUR newlines', () => {
      const input = "[empty]\n\n\n\n[/empty]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n\n[/][0]\n");
    });

    it('renders a divclass within other content', () => {
      const input = "outside of div\n\n[divname]\n\ninside div\n\n[/divname]\n\nmore outside";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("outside of div\n\n[][0]\n\ninside div\n\n[/][0]\n\nmore outside\n");
    });

    it("doesn't care about duplicate classes", () => {
      const input = "[classname]\n\nfirst\n\n[/classname]\n\n[classname]\n\nsecond\n\n[/classname]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n\nfirst\n\n[/][0]\n\n[][1]\n\nsecond\n\n[/][1]\n");
    });

    it('can redact nested divclasses', () => {
      const input = "[outer]\n\n[inner]\n\nnested\n\n[/inner]\n\n[/outer]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n\n[][1]\n\nnested\n\n[/][1]\n\n[/][0]\n");
    });

    it('can redact inline content inside a divclass', () => {
      const input = "[complex-example]\n\n-   an ordered list\n-   with [other redacted content](http://example.com)\n\n[/complex-example]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n\n-   an ordered list\n-   with [other redacted content][1]\n\n[/][0]\n");
    });
  });

  describe('restore', () => {
    it('can restore basic divclasses back to markdown', () => {
      const source = "[col-33]\n\nsimple content\n\n[/col-33]";
      const redacted = "[][0]\n\ncontenu simple\n\n[/][0]\n";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[col-33]\n\ncontenu simple\n\n[/col-33]\n");
    });

    it('can restore basic divclasses', () => {
      const source = "[col-33]\n\nsimple content\n\n[/col-33]";
      const redacted = "[][0]\n\ncontenu simple\n\n[/][0]\n";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<div class=\"col-33\"><p>contenu simple</p></div>\n");
    });

    it('can restore nested divclasses', () => {
      const source = "[outer]\n\n[inner]\n\nnested\n\n[/inner]\n\n[/outer]";
      const redacted = "[][0]\n\n[][1]\n\nimbriqué\n\n[/][1]\n\n[/][0]\n";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<div class=\"outer\"><div class=\"inner\"><p>imbriqué</p></div></div>\n");
    });

    it('can restore inline content inside a divclass', () => {
      const source = "[complex-example]\n\n-   an ordered list\n-   with [other redacted content](http://example.com)\n\n[/complex-example]";
      const redacted = "[][0]\n\n-   une liste ordonnée\n-   avec [d'autres contenus rédigés][1]\n\n[/][0]\n";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<div class=\"complex-example\"><ul>\n<li>une liste ordonnée</li>\n<li>avec <a href=\"http://example.com\">d'autres contenus rédigés</a></li>\n</ul></div>\n");
    });

    it('can restore content with reordered indexes', () => {
      const source = "[zero]\n\nzero\n\n[/zero]\n\n[one]\n\none\n\n[/one]";
      const redacted = "[][1]\n\nun\n\n[/][1]\n\n[][0]\n\nzéro\n\n[/][0]";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<div class=\"one\"><p>un</p></div>\n<div class=\"zero\"><p>zéro</p></div>\n");
    });

    it('can restore content with nesting changes', () => {
      const source = "[zero]\n\n[one]\n\n\n\n[/one]\n\n[/zero]"

      const unNestedRedaction = "[][0]\n\n\n\n[/][0]\n\n[][1]\n\n\n\n[/][1]";
      expect(parser.sourceAndRedactedToHtml(source, unNestedRedaction))
        .toEqual("<div class=\"zero\"></div>\n<div class=\"one\"></div>\n");

      const invertedRedaction = "[][1]\n\n[][0]\n\n\n\n[/][0]\n\n[/][1]";
      expect(parser.sourceAndRedactedToHtml(source, invertedRedaction))
        .toEqual("<div class=\"one\"><div class=\"zero\"></div></div>\n");

      const brokenRedaction = "[][0]\n\n[][1]\n\n\n\n[/][0]\n\n[/][1]"
      expect(parser.sourceAndRedactedToHtml(source, brokenRedaction))
        .toEqual("<div class=\"zero\"><p><a href=\"\"></a></p></div>\n<p><a href=\"\">/</a></p>\n");
    });

    it('can restore content that adds extra content', () => {
      const source = "[first]\n\nFirst\n\n[/first]\n\n[second]\n\nSecond\n\n[/second]";

      const reusedIndex = "[][0]\n\nPremier\n\n[/][0]\n\n[][1]\n\nDeuxième\n\n[/][1]\n\n[][1]\n\nTroisième\n\n[/][1]"
      expect(parser.sourceAndRedactedToHtml(source, reusedIndex))
        .toEqual("<div class=\"first\"><p>Premier</p></div>\n<div class=\"second\"><p>Deuxième</p></div>\n<div class=\"second\"><p>Troisième</p></div>\n");

      // in every case, extra redactions default to empty links
      const extraIndex = "[][0]\n\nPremier\n\n[/][0]\n\n[][1]\n\nDeuxième\n\n[/][1]\n\n[][2]\n\nTroisième\n\n[/][2]"
      expect(parser.sourceAndRedactedToHtml(source, extraIndex))
        .toEqual("<div class=\"first\"><p>Premier</p></div>\n<div class=\"second\"><p>Deuxième</p></div>\n<p><a href=\"\"></a></p>\n<p>Troisième</p>\n<p><a href=\"\">/</a></p>\n");
    });

    it('can NOT restore content if required whitespace is removed', () => {
      const source = "[clazz]\n\nCat\n\n[/clazz]";
      const redacted = "[][0]\nChat\n[/][0]";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p><a href=\"\"></a>\nChat\n<a href=\"\">/</a></p>\n");
    });
  });
});
