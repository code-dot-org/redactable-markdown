const html = require('remark-html');
const parse = require('remark-parse');
const stringify = require('remark-stringify');

const div = require('./plugins/compiler/div');
const indent = require('./plugins/compiler/indent');

const divclass = require('./plugins/parser/divclass');
const redactedLink = require('./plugins/parser/redactedLink');

const RedactableProcessor = require('./redactableProcessor');

module.exports = class RedactableMarkdownProcessor extends RedactableProcessor {
  sourceToHtml(source) {
    return this.getProcessor()
      .use(html)
      .processSync(source).contents;
  }

  sourceToSyntaxTree(source) {
    return this.getProcessor().parse(source);
  }

  sourceAndRedactedToHtml(source, redacted) {
    const restoredMarkdown = this.sourceAndRedactedToRestored(source, redacted);
    return this.sourceToHtml(restoredMarkdown);
  }

  /**
   * @override
   */
  static getParser() {
    return {
      plugins: [parse],
      settings: {
        commonmark: true,
        pedantic: true
      }
    };
  }

  /**
   * @override
   */
  static getParserPlugins() {
    return super.getParserPlugins().concat([divclass, redactedLink]);
  }

  /**
   * @override
   */
  static getCompiler() {
    return stringify;
  }

  /**
   * @override
   */
  static getCompilerPlugins() {
    return super.getCompilerPlugins().concat([div, indent]);
  }

  /**
   * @override
   */
  static create() {
    return new RedactableMarkdownProcessor();
  }
};
