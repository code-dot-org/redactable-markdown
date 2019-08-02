const unified = require("unified");
const html = require("remark-html");
const parse = require("remark-parse");
const stringify = require("remark-stringify");
const { plugins } = require("remark-redactable");

const div = require("./plugins/compiler/div");
const indent = require("./plugins/compiler/indent");

const divclass = require("./plugins/parser/divclass");

const RedactableProcessor = require("./redactableProcessor");

module.exports = class RedactableMarkdownProcessor extends RedactableProcessor {
  sourceToHtml(source) {
    return unified()
      .use(this.constructor.getParser())
      .use(html)
      .use(this.parserPlugins)
      .use(this.compilerPlugins)
      .processSync(source).contents;
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
    return super.getParserPlugins().concat([divclass, plugins.redactedLink]);
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
