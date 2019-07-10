const unified = require('unified');

const TextParser = require('./plugins/parser/TextParser');
const TextCompiler = require('./plugins/compiler/TextCompiler');

const renderRedactions = require('./plugins/process/renderRedactions');
const restoreRedactions = require('./plugins/process/restoreRedactions');
const restorationRegistration = require('./plugins/process/restorationRegistration');

const rawtext = require('./plugins/compiler/rawtext');

const visit = require('unist-util-visit');

module.exports = class RedactableProcessor {
  constructor() {
    this.compilerPlugins = this.constructor.getCompilerPlugins();
    this.processor = unified()
      .use(this.constructor.getParser())
      .use(this.constructor.getParserPlugins());
  }

  getProcessor() {
    return this.processor();
  }

  sourceToRedactedSyntaxTree(source) {
    return this.getProcessor()
      .use({settings: {redact: true}})
      .parse(source);
  }

  sourceToProcessed(source) {
    return this.getProcessor()
      .use(this.constructor.getCompiler())
      .use(this.compilerPlugins)
      .processSync(source).contents;
  }

  sourceToRedacted(source) {
    const sourceTree = this.sourceToRedactedSyntaxTree(source);
    return this.getProcessor()
      .use(this.constructor.getCompiler())
      .use(renderRedactions)
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

    return source_redactions === redacted_restorations &&
           redacted_redactions === 0 &&
           redacted_unrestored === 0;
  }

  sourceAndRedactedToMergedSyntaxTree(sourceTree, redacted, strict) {
    let settings = { redact: strict, strict: strict};
    const mergedTree = this.getProcessor()
      .use(restoreRedactions(sourceTree))
      .use({settings: settings})
      .parse(redacted);
    return mergedTree;
  }

  sourceAndRedactedToRestored(source, redacted, strict) {
    const sourceTree = this.sourceToRedactedSyntaxTree(source);
    const mergedSyntaxTree = this.sourceAndRedactedToMergedSyntaxTree(
      sourceTree,
      redacted,
      strict
    );
    if (strict && !this.checkRestorationNodes(sourceTree, mergedSyntaxTree)) {
      return "\n";
    }
    return this.getProcessor()
      .use(this.constructor.getCompiler())
      .use(this.compilerPlugins)
      .stringify(mergedSyntaxTree);
  }

  static getParser() {
    return TextParser;
  }

  static getParserPlugins() {
    return [restorationRegistration];
  }

  static getCompiler() {
    return TextCompiler;
  }

  static getCompilerPlugins() {
    return [rawtext];
  }

  static create() {
    return new RedactableProcessor();
  }
};
