/**
 * @file divclass
 * @example
 *
 * ### Divclass
 * 
 * We support the ability to wrap content in divs with a declared class
 * attribute. Any kind of block content is supported; to wrap the content, simply
 * precede it with a block entirely consisting of the class name wrapped in square
 * bracked and succeed it with a block entirely consisting of the class name
 * preceeded by a forward slash and wrapped in square brackets.
 * 
 * [col-33]
 * 
 * This is some simple content that will be wrapped in a div with the class "col-33"
 * 
 * [/col-33]
 * 
 * [col-33]
 * 
 * - This is a ul, which will also be wrapped in a div with the class "col-33".
 * - Note that because this is dealing with classes and not ids, duplicate class
 * - names are just fine.
 * 
 * [/col-33]
 * 
 * [outer]
 * 
 * [inner]
 * 
 * Nesting of classes is also supported.
 * 
 * [/inner]
 * 
 * [/outer]
 * 
 * [unsupported]
 * 
 * Some things that are NOT supported:
 * 
 * - inline divclasses like [example]this[/example]
 * - generic endings like [example]\n\ncontent\n\n[/]
 * - indentation like [example]\n\n    content\n\n[/example]
 *   - in this case, 'content' would be treated as a code block
 * 
 * [/unsupported]
 *
 * Note that you can also add an empty div without content like so:
 *
 * [empty]
 *
 *
 *
 * [/empty]
 *
 * ### Redacting
 *
 * Divclasses will be redacted to just [] and [/]:
 *
 * []
 * 
 * This is some simple content that will be wrapped in a div with the class "col-33"
 * 
 * [/]
 */

const DIVCLASS_OPEN_RE = /^\[([\w-]+)\]\n\n/;

let redact;

module.exports = function divclass() {

  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  const restorationMethods = Parser.prototype.restorationMethods;

  restorationMethods.divclass = function (add, nodes, content, children) {
    return add({
      type: 'div',
      children,
      data: {
        hProperties: {
          className: nodes.open.className
        },
      }
    });
  }

  redact = Parser.prototype.options.redact;

  tokenizers.divclass = tokenizeDivclass;

  /* Run it just before `paragraph`. */
  methods.splice(methods.indexOf('paragraph'), 0, 'divclass');
}

tokenizeDivclass.notInLink = true;

function tokenizeDivclass(eat, value, silent) {
  const startMatch = DIVCLASS_OPEN_RE.exec(value)

  if (!startMatch) {
    return;
  }

  const divclassOpen = startMatch[0];
  const startIndex = startMatch[0].length;
  const className = startMatch[1];

  const divclassClose = `\n\n[/${className}]`;
  const endIndex = value.slice(startIndex).indexOf(divclassClose);

  if (endIndex === -1) {
    return;
  }

  if (silent) {
    return true;
  }

  const subvalue = value.slice(startIndex, startIndex + endIndex);
  const contents = this.tokenizeBlock(subvalue, eat.now());

  if (redact) {
    const open = eat(divclassOpen)({
      type: 'redaction',
      redactionType: 'divclass',
      className: className,
      block: true
    });

    const add = eat(subvalue);
    const content = contents.map((content) => add(content));

    const close = eat(divclassClose)({
      type: 'redaction',
      //redactionType: 'divclass',
      //className: className,
      block: true,
      closing: true
    });

    return [open, ...content, close]
  }

  return eat(divclassOpen + subvalue + divclassClose)({
    type: 'div',
    children: contents,
    data: {
      hProperties: {
        className: className
      },
    }
  });
}
