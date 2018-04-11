let redact;

const removeIndentation = require('remark-parse/lib/util/remove-indentation');

const RE = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?\n/

module.exports = function mention() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  redact = Parser.prototype.options.redact;

  tokenizers.tip = tokenizeTip;

  /* Run it just before `text`. */
  methods.splice(methods.indexOf('paragraph'), 0, 'tip');
}

function tokenizeTip(eat, value, silent) {
  const match = RE.exec(value);
  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  // find the indented block that represents the content of the tip
  let index = match[0].length;
  while (index < value.length) {
    index++;
    if (value.charAt(index) === "\n") {
      //if (value.slice(index + 1, index + 5) !== "    ") {
      if (value.charAt(index + 1) !== " ") {
        break;
      }
    }
  }

  const title = match[2];
  const subvalue = value.slice(match[0].length, index);
  const contents = this.tokenizeBlock(removeIndentation(subvalue, 4), eat.now());

  if (redact) {
    const open = eat(match[0])({
      type: 'redaction',
      redactionType: 'tip',
      children: [{
        type: "text",
        value: title
      }],
      block: true
    })

    const add = eat(subvalue);
    const content = contents.map((content) => add(content));

    const close = add({
      type: 'redaction',
      block: true,
      closing: true
    });

    return [open, ...content, close]
  }

  return eat(match[0] + subvalue)({
    type: "div",
    children: [{
      type: "paragraph",
      children: [{
        type: 'emphasis',
        children: [],
        data: {
          hName: 'i',
          hProperties: {
            className: "fa fa-lightbulb-o"
          }
        }
      }, {
        type: "text",
        value: title
      }],
      data: {
        hProperties: {
          className: "admonition-title",
          id: "tip_tip-0"
        }
      }
    }, {
      type: "div",
      children: contents
    }],
    data: {
      hProperties: {
        className: "admonition tip"
      }
    }
  });
}
