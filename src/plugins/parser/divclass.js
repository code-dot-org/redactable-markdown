/**
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
 * Divclasses will be redacted to just [][0] and [/][0], where "0" is the
 * zero-based index of the divclass in the set of all redactions in the content:
 *
 * [][0]
 *
 * This is some simple content that will be wrapped in a div with the class "col-33"
 *
 * [/][0]
 */

const DIVCLASS_OPEN_RE = /^\[([\w-]+)\] *\n *\n/;

let redact;

module.exports = function divclass() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;
  const restorationMethods = Parser.prototype.restorationMethods;

  restorationMethods.divclass = function(add, node, content, children) {
    const open = add({
      type: "paragraph",
      children: [
        {
          type: "rawtext", // use rawtext rather than text to avoid escaping the `[`
          value: `[${node.className}]`
        }
      ]
    });

    // Restored divclasses must always have a child; otherwise, an empty
    // restored divclass would look like `[classname]\n\n[/classname]` which is
    // not recognized by the parser.
    // See the test "divclass render works without content - but only if separated by FOUR newlines".
    // If the parser can be taught to reliably recognize a divclass without that
    // requirement, this step can be removed
    if (!(children && children.length)) {
      children = [
        {
          type: "text",
          value: ""
        }
      ];
    }
    const childNodes = children.map(child => add(child));

    const close = add({
      type: "paragraph",
      children: [
        {
          type: "rawtext",
          value: `[/${node.className}]`
        }
      ]
    });

    return [open, ...childNodes, close];
  };

  redact = Parser.prototype.options.redact;

  tokenizers.divclass = tokenizeDivclass;

  /* Run it just before `paragraph`. */
  methods.splice(methods.indexOf("paragraph"), 0, "divclass");
};

tokenizeDivclass.notInLink = true;

function tokenizeDivclass(eat, value, silent) {
  const startMatch = DIVCLASS_OPEN_RE.exec(value);

  if (!startMatch) {
    return;
  }

  const divclassOpen = startMatch[0];
  const startIndex = startMatch[0].length;
  const className = startMatch[1];

  const MATCHING_DIVCLASS_OPEN_RE = new RegExp(
    `\\[${className}\\] *\\n *\\n`,
    "g"
  );
  const MATCHING_DIVCLASS_CLOSE_RE = new RegExp(
    `\\n *\\n *\\[\\/${className}\\]`,
    "g"
  );

  MATCHING_DIVCLASS_CLOSE_RE.lastIndex = startIndex;

  let nextMatchingClose;
  let subvalue;
  let endIndex;

  do {
    // find the first instance of a matching close block in the rest of the
    // value string. Note that because of nesting, this may not necessarily be
    // the actual matching close block we want.
    nextMatchingClose = MATCHING_DIVCLASS_CLOSE_RE.exec(value);

    // if at any point we "run out" of matches before finding a valid one, then
    // fail fast
    if (MATCHING_DIVCLASS_CLOSE_RE.lastIndex === 0) {
      return;
    }
    endIndex =
      MATCHING_DIVCLASS_CLOSE_RE.lastIndex - nextMatchingClose[0].length;
    subvalue = value.slice(startIndex, endIndex);

    // to find out, we look at everything in between the opening block and the
    // selected closing block. If there are an equal number of opens and closes
    // within that subvalue, we're good; otherwise, select the next matching close
    // and try again
  } while (
    subvalue.split(MATCHING_DIVCLASS_OPEN_RE).length !==
    subvalue.split(MATCHING_DIVCLASS_CLOSE_RE).length
  );

  if (silent) {
    return true;
  }

  const divclassClose = nextMatchingClose[0];
  const contents = this.tokenizeBlock(subvalue, eat.now());

  const add = eat(divclassOpen + subvalue + divclassClose);

  if (redact) {
    return add({
      type: "redaction",
      block: true,
      children: contents,
      className: className,
      redactionType: "divclass"
    });
  }

  return add({
    type: "div",
    children: contents,
    data: {
      hProperties: {
        className: className
      }
    }
  });
}
