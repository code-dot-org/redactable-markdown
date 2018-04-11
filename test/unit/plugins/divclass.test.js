const expect = require('expect');
const parser = require('../../../src/cdoFlavoredParser');

describe('divclass', () => {
  describe('render', () => {
    it('renders a basic divclass', () => {
      const input = "[col-33]\n\nsimple content\n\n[/col-33]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"col-33\"><p>simple content</p></div>\n");
    });

    it('works without content - but only if separated by FOUR newlines', () => {
      const input = "[empty]\n\n\n\n[/empty]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<div class=\"empty\"></div>\n");
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
  });
});
