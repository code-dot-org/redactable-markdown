let redact;

const getIndentation = require('remark-parse/lib/util/get-indentation');
const removeIndentation = require('remark-parse/lib/util/remove-indentation');
const trimTrailingLines = require('trim-trailing-lines');

const RE = /^!!! ?([\w-]+)(?: "(.*?)")?(?: <(.*?)>)?/

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

  const subvalue = value.slice(match[0].length, index);
  let contents = this.tokenizeBlock(removeIndentation(subvalue.slice(2), 4), eat.now());
  return eat(match[0] + subvalue)(contents[0]);
}
