const unified = require("unified");
const {
  redact,
  restore,
  findRestorations,
  renderRestorations
} = require("remark-redactable");
const plugins = require("@code-dot-org/remark-plugins");

const TextParser = require("./plugins/parser/TextParser");
const TextCompiler = require("./plugins/compiler/TextCompiler");

module.exports = class RedactableProcessor {
  constructor() {
    this.compilerPlugins = [plugins.rawtext, renderRestorations];
    this.parserPlugins = [];
  }

  sourceToSyntaxTree(source) {
    return unified()
      .use(this.constructor.getParser())
      .use(this.parserPlugins)
      .parse(source);
  }

  sourceToRedactedSyntaxTree(source) {
    return unified()
      .use(this.constructor.getParser())
      .use(redact)
      .use(this.parserPlugins)
      .parse(source);
  }

  redactedToSyntaxTree(redacted) {
    return unified()
      .use(this.constructor.getParser())
      .use(findRestorations)
      .use(this.parserPlugins)
      .parse(redacted);
  }

  sourceToProcessed(source) {
    return unified()
      .use(this.constructor.getParser())
      .use(this.constructor.getCompiler())
      .use(this.parserPlugins)
      .use(this.compilerPlugins)
      .processSync(source).contents;
  }

  sourceToRedacted(source) {
    const sourceTree = this.sourceToRedactedSyntaxTree(source);
    return unified()
      .use(this.constructor.getParser())
      .use(this.constructor.getCompiler())
      .use(redact)
      .use(this.parserPlugins)
      .use(this.compilerPlugins)
      .stringify(sourceTree);
  }

  sourceAndRedactedToMergedSyntaxTree(sourceTree, restorationTree) {
    const restorationMethods = this.parserPlugins
      .map(plugin => plugin.restorationMethods)
      .reduce((acc, val) => Object.assign({}, acc, val), {});
    const mergedTree = unified()
      .use(restore, sourceTree, restorationMethods)
      .runSync(restorationTree);

    return mergedTree;
  }

  sourceAndRedactedToRestored(source, redacted) {
    const sourceTree = this.sourceToRedactedSyntaxTree(source);
    const restorationTree = this.redactedToSyntaxTree(redacted);
    const mergedSyntaxTree = this.sourceAndRedactedToMergedSyntaxTree(
      sourceTree,
      restorationTree
    );
    return unified()
      .use(this.constructor.getParser())
      .use(this.constructor.getCompiler())
      .use(this.parserPlugins)
      .use(this.compilerPlugins)
      .stringify(mergedSyntaxTree);
  }

  static getParser() {
    return TextParser;
  }

  static getCompiler() {
    return TextCompiler;
  }

  static create() {
    return new RedactableProcessor();
  }
};
