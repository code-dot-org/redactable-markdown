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

  restorationMethods.divclass = function (add, node) {
    console.log(node);
  }

  redact = Parser.prototype.options.redact;

  tokenizers.divclass = tokenizeDivclass;

  /* Run it just before `paragraph`. */
  methods.splice(methods.indexOf('paragraph'), 0, 'divclass');
}

//module.exports.out = function out() {
//  var Compiler = this.Compiler;
//  var visitors = Compiler.prototype.visitors;
//  //console.log(Compiler);
//  //console.log(Compiler.prototype);
//  //console.log(visitors);

//  var original = visitors.linkReference;
//  visitors.linkReference = function heading(node) {
//    const definitions = this.tree.children.filter(child => child.type === "definition");

//    const mydef = definitions.find(def => def.identifier.toLowerCase() === node.identifier.toLowerCase());

//    if (mydef && mydef.meta) {
//      switch (mydef.meta) {
//        case 'link':
//        case 'image':
//          break
//        case 'divclass':
//          console.log(mydef, node);
//          const val = node.children.length ? node.children[0].value : "";
//          return "[" + val + mydef.url + "]";
//          break
//      }
//    }

//    return original.apply(this, arguments);
//  }
//}

tokenizeDivclass.notInLink = true;

function tokenizeDivclass(eat, value, silent) {
  const startMatch = DIVCLASS_OPEN_RE.exec(value)

  if (!startMatch) {
    return;
  }

  const startIndex = startMatch[0].length;
  const className = startMatch[1];
  const DIVCLASS_CLOSE_RE = RegExp(`\n\n\\[/${className}\\]`);

  const endMatch = DIVCLASS_CLOSE_RE.exec(value.slice(startIndex))

  if (!endMatch) {
    return;
  }

  if (silent) {
    return true;
  }

  const endIndex = startIndex + endMatch.index;
  const subvalue = value.slice(startIndex, endIndex);
  const contents = this.tokenizeBlock(subvalue, eat.now());

  if (redact) {
    const open = eat(startMatch[0])({
      type: 'redaction',
      redactionType: 'divclass',
      className: className,
    });

    const add = eat(subvalue);
    const content = contents.map((content) => add(content));

    const close = eat(endMatch[0])({
      type: 'redaction',
      redactionType: 'divclass',
      className: className,
      closing: true
    });

    return [open, ...content, close]
  }

  return eat(startMatch[0] + subvalue + endMatch[0])({
    type: 'div',
    children: contents,
    data: {
      hProperties: {
        className: className
      },
    }
  });
}
