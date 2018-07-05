const expect = require('expect');
const parser = require('../../../../src/redactableMarkdownParser').create();
const tipPlugin = require('./tip');
parser.parser.use(tipPlugin);

describe('tip', () => {
  describe('render', () => {
    it('renders a basic tip', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      /**
       * <div class="admonition tip">
       *   <p class="admonition-title" id="tip_tip-0">
       *     <i class="fa fa-lightbulb-o"></i>
       *     this is an optional title, and it should be translatable
       *   </p>
       *   <div>
       *     <p>
       *       This is the content of the tip, and it should be translatable This is more stuff that is still part of the content of the tip
       *     </p>
       *   </div>
       * </div>
       * <p>This is the next paragraph</p>
       */
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i>this is an optional title, and it should be translatable</p><div><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });

    it('renders a basic tip even with weird indentation', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n\tThis is the content of the tip, and it should be translatable, as should all the following blocks:\n \tone\n\t\t\t\ttwo\n \t three\n              four\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      /**
       * <div class="admonition tip">
       *   <p class="admonition-title" id="tip_tip-0">
       *     <i class="fa fa-lightbulb-o"></i>
       *     this is an optional title, and it should be translatable
       *   </p>
       *   <div>
       *     <p>
       *       This is the content of the tip, and it should be translatable, as
       *       should all the following blocks: one two three four
       *     </p>
       *   </div>
       * </div>
       * <p>This is the next paragraph</p>
       */
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i>this is an optional title, and it should be translatable</p><div><p>This is the content of the tip, and it should be translatable, as should all the following blocks:\none\ntwo\nthree\nfour</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });

    it('renders a basic tip without an id', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\"><i class=\"fa fa-lightbulb-o\"></i>this is an optional title, and it should be translatable</p><div><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });

    it('renders a basic tip without a title', () => {
      const input = "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i></p><div><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });

    it('renders a tip with multiple children', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      /**
       * <div class="admonition tip">
       *   <p class="admonition-title" id="tip_tip-0">
       *     <i class="fa fa-lightbulb-o"></i>
       *     this is an optional title, and it should be translatable
       *   </p>
       *   <div>
       *     <p>
       *       This is the content of the tip, and it should be translatable
       *     </p>
       *     <p>
       *       This is more stuff that is still part of the content of the tip
       *     </p>
       *   </div>
       * </div>
       * <p>This is the next paragraph</p>
       */
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i>this is an optional title, and it should be translatable</p><div><p>This is the content of the tip, and it should be translatable</p><p>This is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });

    it('renders a basic tip indented with tabs', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n\tThis is the content of the tip, and it should be translatable\n\tThis is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      /*
       <div class="admonition tip">
         <p class="admonition-title" id="tip_tip-0">
           <i class="fa fa-lightbulb-o"></i>
           this is an optional title, and it should be translatable
         </p>
         <div>
           <p>
             This is the content of the tip, and it should be translatable This is more stuff that is still part of the content of the tip
           </p>
         </div>
       </div>
       <p>This is the next paragraph</p>
       */
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i>this is an optional title, and it should be translatable</p><div><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });
  });

  describe('redact', () => {
    it('can redact a basic tip', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToRedacted(input);
      /**
       * [this is an optional title, and it should be translatable][0]
       * 
       * This is the content of the tip, and it should be translatable
       * This is more stuff that is still part of the content of the tip
       * 
       * [/][0]
       * 
       * This is the next paragraph
       */
      expect(output).toEqual("[this is an optional title, and it should be translatable][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n");
    });

    it('can redact a basic tip without an id', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[this is an optional title, and it should be translatable][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n");
    });

    it('can redact a basic tip without a title', () => {
      const input = "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n");
    });
  });

  describe('restore', () => {
    it('can restore a basic tip', () => {
      const source = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const redacted = "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      const expected = "!!!tip \"c'est une optional title, and it should be translatable\" <tip-0>\n    C'est du content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
      expect(output).toEqual(expected);
    });

    it('can restore a basic tip with multiple children', () => {
      const source = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const redacted = "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\n\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      const expected = "!!!tip \"c'est une optional title, and it should be translatable\" <tip-0>\n    C'est du content of the tip, and it should be translatable\n\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
      expect(output).toEqual(expected);
    });

    it('can restore a basic tip without an id', () => {
      const source = "!!!tip \"this is an optional title, and it should be translatable\"\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const redacted = "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      const expected = "!!!tip \"c'est une optional title, and it should be translatable\"\n    C'est du content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
      expect(output).toEqual(expected);
    });

    it('can restore a basic tip without a title', () => {
      const source = "!!!tip <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const redacted = "[][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      const expected = "!!!tip <tip-0>\n    C'est du content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph\n";
      expect(output).toEqual(expected);
    });
  });
});
