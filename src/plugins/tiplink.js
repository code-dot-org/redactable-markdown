let redact;

const TIPLINK_RE = /^([\w-]+)!!! ?([\w-]+)?/

module.exports = function mention() {
  if (this.Parser) {
    const Parser = this.Parser;
    const tokenizers = Parser.prototype.inlineTokenizers;
    const methods = Parser.prototype.inlineMethods;

    redact = Parser.prototype.options.redact;

    /* Add an inline tokenizer (defined in the following example). */
    tokenizers.tiplink = tokenizeTiplink;

    /* Run it just before `text`. */
    methods.splice(methods.indexOf('text'), 0, 'tiplink');
  }
}

tokenizeTiplink.notInLink = true;
tokenizeTiplink.locator = locateTiplink;

function tokenizeTiplink(eat, value, silent) {
  const match = TIPLINK_RE.exec(value);

  if (match) {
    if (silent) {
      return true;
    }

    const add = eat(match[0]);
    const tip_type = match[1];
    const tip_link = match[2];

    if (redact) {
      return add({
        type: 'redaction',
        redactionType: 'tiplink',
        content: match[0],
      });
    }

    const element = {
      type: 'paragraph',
      children: [],
      data: {
        hProperties: {
          className: `tiplink tiplink-${tip_type}`,
        },
      },
    }


    let icon;
    if (tip_type == 'tip') {
      icon = "lightbulb-o";
    } else if (tip_type == 'discussion') {
      icon = "comments";
    } else if (tip_type == 'content') {
      icon = "mortar-board";
    } else {
      icon = "warning";
    }

    const child = add({
      type: 'link',
      url: `#${tip_type}_${tip_link}`,
      children: []
    }, element);

    add({
      type: 'emphasis',
      children: [],
      data: {
        hName: 'i',
        hProperties: {
          className: `fa fa-${icon}`
        },
      },
    }, child)

    return add(element);
  }
}

function locateTiplink(value, fromIndex) {
  return fromIndex;
}
