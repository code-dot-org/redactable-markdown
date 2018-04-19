let redact;

const VOCABLINK_RE = /^\[v ([^\]]+)\](?:\[([^\]]+)\])?/;
const VOCABLINK = 'vocablink';

/**
 * Plugin that adds support for Curriculum Builder's vocablinks.
 *
 * Note that vocab links are ONLY supported in redaction mode; rendering them
 * out requires CurriculumBuilder database access, so they can only be rendered
 * by Curriculum Builder itself.
 *
 * see https://github.com/mrjoshida/curriculumbuilder/blob/bf74aa5/curriculumBuilder/vocablinks.py
 * @requires restorationRegistration
 */
module.exports = function vocablink() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[VOCABLINK] = tokenizeVocablink;

    Parser.prototype.restorationMethods[VOCABLINK] = function (add, node, content) {
      let value = `[v ${node.vocabword}]`;
      if (content) {
        value += `[${content}]`
      }
      return add({
        type: 'rawtext',
        value 
      });
    }

    // Run it just before `html`
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, VOCABLINK);
  }
}

tokenizeVocablink.notInLink = true;
tokenizeVocablink.locator = locateVocablink;

function tokenizeVocablink(eat, value, silent) {
  const match = VOCABLINK_RE.exec(value);

  // Vocab links are ONLY supported in redaction mode
  if (match && redact) {
    if (silent) {
      return true;
    }

    const vocabword = match[1];
    const override = match[2];
    return eat(match[0])({
      type: 'redaction',
      redactionType: VOCABLINK,
      vocabword,
      children: [{
        type: 'text',
        value: override || vocabword
      }]
    });
  }
}

function locateVocablink(value, fromIndex) {
  return value.indexOf("[v ", fromIndex);
}
