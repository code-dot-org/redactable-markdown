const unified = require('unified');
const {
  redact,
  restore,
  parseRestorations,
  renderRestorations,
} = require('remark-redactable');
const plugins = require('@code-dot-org/remark-plugins');

const TextParser = require('./plugins/parser/TextParser');
const TextCompiler = require('./plugins/compiler/TextCompiler');

const visit = require('unist-util-visit');

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
      .use(parseRestorations)
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

  /* This function checks that
   * 1. Redactions in the sourceTree == restorations performed
   * 2. There are no redactions that weren't performed
   * 3. There was no additions redactable content in the mergedTree
   * */
  checkRestorationNodes(sourceTree, mergedTree) {
    let source_redactions = 0;
    let redacted_restorations = 0;
    let redacted_redactions = 0;
    let redacted_unrestored = 0;
    visit(sourceTree, function(node) {
      if (node.type === 'redaction') {
        source_redactions++;
      }
    });
    visit(mergedTree, function(node) {
      if (node.type === 'redaction') {
        redacted_redactions++;
      }
      if (node.type === 'unrestored') {
        redacted_unrestored++;
      }
      if (node.restored) {
        redacted_restorations++;
      }
    });

    return (
      source_redactions === redacted_restorations &&
      redacted_redactions === 0 &&
      redacted_unrestored === 0
    );
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
      restorationTree,
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
