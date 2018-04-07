let redact;
let tokenizeLink;

/**
 * Parser extension to support rendering of links (and images) when in redact
 * mode.
 *
 * Note that most plugins that support redact mode are adding the ability to
 * parse an entirely new syntax in both normal and redact mode, whereas this one
 * is _extending_ the build-in ability to parse links (and image) to add redact
 * mode.
 *
 * As such, this basically acts as an interstitial between the build-in image
 * method to turn its output into a redaction when appropriate.
 *
 * @see https://github.com/remarkjs/remark/tree/remark-parse%405.0.0/packages/remark-parse#extending-the-parser
 */
module.exports = function redactedLink() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  redact = Parser.prototype.options.redact;
  tokenizeLink = tokenizers.link;

  tokenizeRedactedLink.locator = tokenizers.link.locator;
  tokenizers.redactedLink = tokenizeRedactedLink

  // If in redacted mode, run this instead of original link tokenizer. If
  // running regularly, do nothing special.
  if (redact) {
    methods.splice(methods.indexOf('link'), 1, 'redactedLink');
  }
}

function tokenizeRedactedLink(eat, value, silent) {
  const link = tokenizeLink.call(this, eat, value, silent);
  if (link) {
    link.redactionType = link.type;
    link.type = 'redaction';
  }

  return link;
}
