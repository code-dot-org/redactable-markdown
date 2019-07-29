/**
 * Add support for rending the redacted nodes generated when parsing source data
 * in redact mode. Redacted content shoulud all be of the form:
 *
 *   [optional text to translate][i]
 *
 * For inline redactions, or
 *
 *   [optional text to translate][i]
 *
 *   ...
 *
 *   [/][i]
 *
 * Where "optional text to translate" is english text that we should expect the
 * translator to modify, `i` is the sequential index of this redaction in the
 * content (used to match the redacted content back up with source content for
 * restoration), and `...` is any markdown.
 *
 * @example
 *
 *   const parse = require('remark-parse');
 *   const stringify = require('remark-stringify');
 *   const unified = require('unified');
 *   const redactedLink = require('./redactedLink');
 *
 *   const source = "Markdown containing [a link](http://example.com) to be redacted"
 *   // returns "Markdown containing [a link][0] to be redacted"
 *   unified().use([
 *     parse,                          // use the standard parser
 *     redactedLink,                   // add the ability to redact links
 *     { settings: { redact: true } }, // put the parser in redaction mode
 *     stringify,                      // output back to markdown
 *     renderRedactions                // use this extension
 *   ]).stringify(source);
 *
 * @see https://github.com/remarkjs/remark/tree/remark-stringify%405.0.0/packages/remark-stringify#extending-the-compiler
 * @see restoreRedactions
 */
module.exports = function renderRedactions() {
  if (this.Compiler) {
    const visitors = this.Compiler.prototype.visitors;
    const stringifyContent = function(node) {
      return (node.content || [])
        .map(content => this.visit(content, node))
        .join("");
    };

    let index = 0;

    visitors.inlineRedaction = function(node) {
      let exit;
      if (node.redactionType === "link" || node.redactionType === "image") {
        exit = this.enterLink();
      }

      const value = stringifyContent(node);

      if (exit) {
        exit();
      }

      return `[${value}][${index++}]`;
    };

    visitors.blockRedaction = function(node) {
      const value = stringifyContent(node);

      const open = `[${value}][${index}]`;
      const close = `[/][${index++}]`;

      const subvalue = this.block(node);

      return [open, subvalue, close].join("\n\n");
    };
  }
};
