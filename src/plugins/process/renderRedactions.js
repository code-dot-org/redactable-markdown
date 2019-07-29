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
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    let index = 0;

    visitors.redaction = function redaction(node) {
      let exit;
      if (node.redactionType === "link" || node.redactionType === "image") {
        exit = this.enterLink();
      }

      const value = (node.content || [])
        .map(content => this.visit(content, node))
        .join("");

      if (exit) {
        exit();
      }

      if (node.block) {
        const open = `[${value}][${index}]`;
        const close = `[/][${index++}]`;
        const subvalue = this.block(node);
        return [open, subvalue, close].join("\n\n");
      } else {
        return `[${value}][${index++}]`;
      }
    };
  }
};
