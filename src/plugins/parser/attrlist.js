let redact;

const ATTRLIST_RE = /{([^}]*)}/;

module.exports = function attrlist() {
  if (this.Parser) {
    const Parser = this.Parser;
    const tokenizers = Parser.prototype.inlineTokenizers;
    const methods = Parser.prototype.inlineMethods;
    const restorationMethods = Parser.prototype.restorationMethods;

    restorationMethods.attrlist = function (add, node, content) {
      restorationMethods[node.elem.redactionType](add, node.elem, content)
      return add({
        type: 'rawtext',
        value: `{${node.attrlistContent}}`
      });
    }

    redact = Parser.prototype.options.redact;

    tokenizers.attrlist = tokenizeAttrlist;

    /* Run it just before `link`. */
    methods.splice(methods.indexOf('link'), 0, 'attrlist');
  }
}

tokenizeAttrlist.notInLink = true;
tokenizeAttrlist.locator = locateAttrlist;

function tokenizeAttrlist(eat, value, silent) {
  const match = ATTRLIST_RE.exec(value);

  if (!match) {
    return;
  }

  // Attrlists are (so far) ONLY supported in redaction mode. Adding render
  // support at some point would be nice, though.
  if (!redact) {
    return;
  }

  if (silent) {
    return true;
  }

  const attrlist = match[0];
  const attrlistContent = match[1];
  const preceeding = value.slice(0, match.index);
  const otherContent = this.tokenizeInline(preceeding, eat.now());
  const elem = otherContent[otherContent.length - 1];

  if (elem && elem.type == "redaction") {
    const add = eat(preceeding + attrlist);
    otherContent.slice(0, -1).forEach(e => add(e));

    if (redact) {
      return add({
        type: 'redaction',
        redactionType: 'attrlist',
        attrlistContent,
        elem,
        children: elem.children
      });
    }
  }
}

function locateAttrlist(value, fromIndex) {
  const match = ATTRLIST_RE.exec(value);
  if (match && match.index >= fromIndex) {
    return match.index;
  }
}
