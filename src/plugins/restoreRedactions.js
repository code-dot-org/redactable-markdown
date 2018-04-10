/**
 * Given some valid MDAST representing source content parsed in redact mode,
 * this method extends a parser to enable it to parse redacted versions of that
 * content.
 *
 * @example
 *
 *   const parse = require('remark-parse');
 *   const stringify = require('remark-stringify');
 *   const unified = require('unified');
 *   const redactedLink = require('./redactedLink');
 *
 *   const source = "Markdown containing [a link](http://example.com) to be redacted"
 *   const sourceTree = unified().use([
 *     parse,                          // use the standard parser
 *     redactedLink,                   // add the ability to redact links
 *     { settings: { redact: true } }, // put the parser in redaction mode
 *   ]).parse(source);
 *
 *   const redacted = "Markdown containing [a modified link][0] that has been redacted"
 *   // returns "Markdown containing [a modified link](http://example.com) that has been redacted"
 *   unified().use([
 *     parse,                         // use the standard parser
 *     restoreRedactions(sourceTree), // use this extension with the source content above
 *     stringify                      // output back to markdown
 *   ]).stringify(redacted);
 *
 * @see https://github.com/remarkjs/remark/tree/remark-parse%405.0.0/packages/remark-parse#extending-the-parser
 * @see renderRedactions
 */
module.exports = function restoreRedactions(sourceTree) {

  // first, walk the source tree and find all redacted nodes.
  const redactions = [];
  function getRedactedValues(node) {
    if (node.type === "redaction") {
      redactions.push(node);
    }

    if (node.children && node.children.length) {
      node.children.forEach(getRedactedValues);
    }
  }
  getRedactedValues(sourceTree);

  // then return an extension to the parser that can consume the data from these
  // redacted nodes when it encounters a redaction
  return function () {
    if (!this.Parser) {
      return;
    }

    const Parser = this.Parser;
    const tokenizers = Parser.prototype.inlineTokenizers;
    const methods = Parser.prototype.inlineMethods;


    // A redacted value looks like [some text][0], where "some text" is
    // something that can be translated and "0" is the index of the redacted
    // value.
    const REDACTION_RE = /^\[([^\]]*)\]\[(\d+)\]/;

    const tokenizeRedaction = function (eat, value, silent) {
      const match = REDACTION_RE.exec(value);
      if (!match) {
        return;
      }

      if (silent) {
        return true;
      }

      const content = match[1]; // the translated data inside the first set of brackets
      const index = parseInt(match[2], 10); // the sequential index inside the second set of brackets
      const redactedData = redactions[index];

      // TODO once we decide on how we want to handle errors, this is where the
      // error handler should probably go
      if (!redactedData) {
        return;
      }

      const restorationMethod = Parser.prototype.restorationMethods[redactedData.redactionType];
      if (!restorationMethod) {
        return
      }

      const add = eat(match[0]);
      return restorationMethod(add, redactedData, content);
    }

    tokenizeRedaction.locator = function (value) {
      return value.search(REDACTION_RE);
    }

    /* Add an inline tokenizer (defined in the following example). */
    tokenizers.redaction = tokenizeRedaction;

    /* Run before default reference. */
    methods.splice(methods.indexOf('reference'), 0, 'redaction');
  }
}
