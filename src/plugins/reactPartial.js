module.exports = function reactPartial() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.blockTokenizers;
  const methods = Parser.prototype.blockMethods;

  tokenizers.reactPartial = tokenizeReactPartial;

  /* Run it just before `paragraph`. */
  methods.splice(methods.indexOf('paragraph'), 0, 'reactPartial');
}

function tokenizeReactPartial(eat, value, silent) {
  const match = /^<(\w+)\n$/.exec(value);

  if (match) {
    if (silent) {
      return true;
    }

    return eat(match[0])({
      type: match[1],
    });
  }
}
