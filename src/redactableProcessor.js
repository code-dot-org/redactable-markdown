const unified = require('unified');

const TextParser = require('./plugins/parser/TextParser');
const TextCompiler = require('./plugins/compiler/TextCompiler');

const renderRedactions = require('./plugins/process/renderRedactions');
const restoreRedactions = require('./plugins/process/restoreRedactions');
const restorationRegistration = require('./plugins/process/restorationRegistration');

const rawtext = require('./plugins/compiler/rawtext');

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

  sourceAndRedactedToMergedSyntaxTree(source, redacted) {
    const sourceTree = this.sourceToRedactedSyntaxTree(source);
    const redactedTree = this.getProcessor()
      .use(restoreRedactions(sourceTree))
      .parse(redacted);

    return redactedTree;
  }

  sourceAndRedactedToRestored(source, redacted) {
    const mergedSyntaxTree = this.sourceAndRedactedToMergedSyntaxTree(
      source,
      redacted
    );
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
