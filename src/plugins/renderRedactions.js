/**
 * Add support for rending the redacted nodes generated when parsing source data
 * in redact mode. Redacted content shoulud all be of the form:
 *
 *   [text to translate][i]
 *
 * Where "text to translate" is english text that we should expect the
 * translator to modify, and `i` is the sequential index of this redaction in
 * the content (used to match the redacted content back up with source content
 * for restoration)
 *
 * @see https://github.com/remarkjs/remark/tree/remark-stringify%405.0.0/packages/remark-stringify#extending-the-compiler
 * @see restoreRedactions
 */
module.exports = function renderRedactions() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    let count = 0;

    visitors.redaction = function redaction(node) {
      let value = "";

      var self = this;
      var exit = self.enterLink();
      if (node.children) {
        value = self.all(node).join('');
      } else if (node.alt) {
        value = self.encode(self.escape(node.alt || '', node))
      }
      exit();

      return `[${value}][${count++}]`;
    }
  }
}

