/**
 * A simple compiler that emulates the style of remark-stringify, but will only
 * stringify plain text, not markdown.
 *
 * Can be used to implement redaction and restoration in a non-markdown context
 *
 * Is currently implemented by taking remark-stringify and removing unwanted
 * functionality; be aware that could have unexpected side effects, and we may
 * at some point in the future want to reimplement this by starting from
 * scratch.
 */

const RemarkCompiler = require("remark-stringify").Compiler;
const unherit = require("unherit");
const xtend = require("xtend");

module.exports = function textCompile(options) {
  const Local = unherit(RemarkCompiler);
  Local.prototype.options = xtend(
    Local.prototype.options,
    this.data("settings"),
    options,
  );

  // Don't escape text like markdown does
  Local.prototype.visitors.text = function (node) {
    return this.encode(node.value, node);
  };

  // Don't add an extra newline like markdown does
  Local.prototype.visitors.root = function (node) {
    return this.block(node);
  };

  this.Compiler = Local;
};
