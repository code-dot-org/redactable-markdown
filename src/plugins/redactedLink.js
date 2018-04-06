let redact;
let tokenizeLink;

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
