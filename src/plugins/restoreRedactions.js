module.exports = function restoreRedactions(sourceTree) {

  let refCount = 0;
  const refs = {};
  function getSourceLinks(node) {
    if (node.type === "link" || node.type === "image") {
      refs[`redactedUrlReference-${refCount++}`] = {
        type: node.type,
        url: node.url
      }
    }

    if (node.type === "redaction") {
      refs[`redactedUrlReference-${refCount++}`] = {
        type: node.redactionType,
        value: node
      }
    }

    if (node.children && node.children.length) {
      node.children.forEach(getSourceLinks);
    }
  }
  getSourceLinks(sourceTree);

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

    const tokenizeRedactedLink = function (eat, value, silent) {
      const match = REDACTION_RE.exec(value);
      if (!match) {
        return;
      }

      if (silent) {
        return true;
      }

      const ref = `redactedUrlReference-${match[2]}`;
      const content = match[1];
      const deref = refs[ref];

      const now = eat.now();

      const extra = {};
      if (deref.type === "link") {
        extra.url = deref.value.url
        extra.children = [{
          type: "text",
          value: content
        }]
      } else if (deref.type === "image") {
        extra.alt = content
        extra.url = deref.value.url
      } else if (deref.type === "tiplink") {
        const node = this.tokenizeInline(deref.value.content, now);
        return eat(match[0])(node[0]);
      }

      return eat(match[0])(Object.assign({}, deref, extra));
    }

    tokenizeRedactedLink.locator = function (value) {
      return value.search(REDACTION_RE);
    }

    /* Add an inline tokenizer (defined in the following example). */
    tokenizers.redactedLink = tokenizeRedactedLink;

    /* Run before default reference. */
    methods.splice(methods.indexOf('reference'), 0, 'redactedLink');
  }
}

