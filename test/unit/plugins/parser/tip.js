let redact;

const removeIndentation = require("remark-parse/lib/util/remove-indentation");

const RE = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?\n/;

module.exports = function tip() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  const restorationMethods = Parser.prototype.restorationMethods;

  restorationMethods.tip = function(add, node, content, children) {
    let value = `!!!${node.tipType}`;
    if (content) {
      value += ` "${content}"`;
    }
    if (node.id) {
      value += ` <${node.id}>`;
    }
    return add({
      type: "paragraph",
      children: [
        {
          type: "rawtext",
          value: value + "\n"
        },
        {
          type: "indent",
          children
        }
      ]
    });
  };

  redact = Parser.prototype.options.redact;

  tokenizers.tip = tokenizeTip;

  /* Run it just before `paragraph`. */
  methods.splice(methods.indexOf("paragraph"), 0, "tip");
};

function tokenizeTip(eat, value, silent) {
  const match = RE.exec(value);
  if (!match) {
    return;
  }

  if (silent) {
    return true;
  }

  // find the indented block that represents the content of the tip. Blocks are
  // considered to be indented if they start with at least four spaces, where a
  // tab is considered to be equivalent to four spaces.
  //
  // This is distinct from considering a block to be indented if it just starts
  // with either four spaces or a tab in that it accounts for blocks that are
  // indented with a combination of tabs and spaces.
  let index = match[0].length;
  while (index < value.length) {
    index++;
    if (value.charAt(index) === "\n") {
      if (value.charAt(index + 1) !== "\n") {
        let nextLine = value.slice(index + 1, index + 5);
        nextLine = nextLine.replace("\t", "    ");
        if (!nextLine.startsWith("    ")) {
          break;
        }
      }
    }
  }

  const tipType = match[1];
  const title = match[2] || "";
  const id = match[3];
  const subvalue = value.slice(match[0].length, index);
  const children = this.tokenizeBlock(
    removeIndentation(subvalue, 4),
    eat.now()
  );
  const add = eat(match[0] + subvalue);

  if (redact) {
    return add({
      type: "redaction",
      redactionType: "tip",
      id,
      tipType,
      children,
      content: [
        {
          type: "text",
          value: title
        }
      ],
      block: true
    });
  }

  return add({
    type: "div",
    children: [
      {
        type: "paragraph",
        children: [
          {
            type: "emphasis",
            children: [],
            data: {
              hName: "i",
              hProperties: {
                className: "fa fa-lightbulb-o"
              }
            }
          },
          {
            type: "text",
            value: title
          }
        ],
        data: {
          hProperties: {
            className: "admonition-title",
            id: id && `tip_${id}`
          }
        }
      },
      {
        type: "div",
        children
      }
    ],
    data: {
      hProperties: {
        className: "admonition tip"
      }
    }
  });
}
