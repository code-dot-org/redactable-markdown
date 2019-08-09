const unified = require("unified");
const html = require("remark-html");
const parse = require("remark-parse");
const stringify = require("remark-stringify");
const plugins = require("@code-dot-org/remark-plugins");

const div = require("./plugins/compiler/div");
const indent = require("./plugins/compiler/indent");
const divclass = require("./plugins/parser/divclass");

const RedactableProcessor = require("./redactableProcessor");

module.exports = class RedactableMarkdownProcessor extends RedactableProcessor {
  constructor() {
    super();
    this.compilerPlugins.push(div, indent);
    this.parserPlugins.push(divclass, plugins.link);
  }

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
  static getCompiler() {
    return stringify;
  }

  /**
   * @override
   */
  static create() {
    return new RedactableMarkdownProcessor();
  }
};
