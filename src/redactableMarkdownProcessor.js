const unified = require("unified");
const html = require("remark-html");
const parse = require("remark-parse");
const stringify = require("remark-stringify");
const plugins = require("@code-dot-org/remark-plugins");

const RedactableProcessor = require("./redactableProcessor");

module.exports = class RedactableMarkdownProcessor extends RedactableProcessor {
  constructor() {
    super();
    this.compilerPlugins.push(plugins.div, plugins.indent);
    this.parserPlugins.push(plugins.divclass, plugins.link);
  }

  sourceToHtml(source) {
    return unified()
      .use(this.constructor.getParser())
      .use(html)
      .use(this.parserPlugins)
      .use(this.compilerPlugins)
      .processSync(source).contents;
  }

  sourceAndRedactedToHtml(source, redacted, strict) {
    const restoredMarkdown = this.sourceAndRedactedToRestored(
      source,
      redacted,
      strict,
    );
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
        pedantic: true,
      },
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
