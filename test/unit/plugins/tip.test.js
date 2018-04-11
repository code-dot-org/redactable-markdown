const expect = require('expect');
const parser = require('../../../src/cdoFlavoredParser');

describe('tip', () => {
  describe('render', () => {
    it('renders a basic tip', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      console.log(output);
    });
  });

  describe('redact', () => {
  });

  describe('restore', () => {
  });
});
