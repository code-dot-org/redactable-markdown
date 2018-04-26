let redact;

const removeIndentation = require('remark-parse/lib/util/remove-indentation');

const RE = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?\n/

module.exports = function tip() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  const restorationMethods = Parser.prototype.restorationMethods;

  restorationMethods.tip = function (add, nodes, content, children) {
    let value = `!!!${nodes.open.tipType}`;
    if (content) {
      value += ` "${content}"`;
    }
    if (nodes.open.id) {
      value += ` <${nodes.open.id}>`;
    }
    return add({
      type: 'paragraph',
      children: [{
        type: 'rawtext',
        value: value + "\n"
      }, {
        type: 'indent',
        children
      }]
    });
  }

  redact = Parser.prototype.options.redact;

  tokenizers.tip = tokenizeTip;

  /* Run it just before `paragraph`. */
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

  // find the indented block that represents the content of the tip. Blocks can
  // be indented by either four spaces or a tab character, and can also contain
  // blank lines separating multiple indented blocks
  let index = match[0].length;
  while (index < value.length) {
    index++;
    if (value.charAt(index) === "\n") {
      if (value.charAt(index + 1) !== "\n") {
        if (!(
          value.charAt(index + 1) === "\t" ||
          value.slice(index + 1, index + 5) === "    "
        )) {
          break;
        }
      }
    }
  }

  const tipType = match[1];
  const title = match[2] || "";
  const id = match[3];
  const subvalue = value.slice(match[0].length, index);
  const children = this.tokenizeBlock(removeIndentation(subvalue, 4), eat.now());

  if (redact) {
    const open = eat(match[0])({
      type: 'redaction',
      redactionType: 'tip',
      id,
      tipType,
      children: [{
        type: "text",
        value: title
      }],
      block: true
    })

    const add = eat(subvalue);
    const content = children.map((child) => add(child));

    const close = add({
      type: 'redaction',
      block: true,
      closing: true
    });

    return [open, ...content, close]
  }

  const add = eat(match[0] + subvalue);
  return add({
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
          id: id && `tip_${id}`
        }
      }
    }, {
      type: "div",
      children
    }],
    data: {
      hProperties: {
        className: "admonition tip"
      }
    }
  });
}
