/**
 * A simple parser that emulates the style of remark-parse, but will only
 * parse plain text, not markdown.
 *
 * Can be used to implement redaction and restoration in a non-markdown context
 *
 * Is currently implemented by taking remark-parse and removing unwanted
 * functionality; be aware that could have unexpected side effects, and we may
 * at some point in the future want to reimplement this by starting from
 * scratch.
 */

const RemarkParser = require('remark-parse').Parser;
const unherit = require('unherit');
const xtend = require('xtend');

module.exports = function textParse(options) {
  const settings = this.data('settings');
  const Local = unherit(RemarkParser);

  Local.prototype.options = xtend(Local.prototype.options, settings, options);

  // Limit tokenizers to only those that parse plain text, not any markdown
  // syntax
  Local.prototype.blockMethods = ['newline', 'paragraph'];
  Local.prototype.inlineMethods = ['text'];
  Local.prototype.interruptParagraph = [];

  this.Parser = Local;
};
