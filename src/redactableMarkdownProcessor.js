const html = require('remark-html');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const unified = require('unified');

const renderRedactions = require('./plugins/process/renderRedactions');
const restoreRedactions = require('./plugins/process/restoreRedactions');
const restorationRegistration = require('./plugins/process/restorationRegistration');

const div = require('./plugins/compiler/div');
const indent = require('./plugins/compiler/indent');
const rawtext = require('./plugins/compiler/rawtext');

const divclass = require('./plugins/parser/divclass');
const redactedLink = require('./plugins/parser/redactedLink');

module.exports = class RedactableMarkdownProcessor {
  constructor() {
    this.compilerPlugins = this.constructor.getCompilerPlugins();
    this.processor = unified()
      .use(this.constructor.getParser())
      .use(this.constructor.getParserPlugins());
  }

  getProcessor() {
    return this.processor();
  }

  sourceToHtml(source) {
    return this.getProcessor()
      .use(html)
      .processSync(source)
      .contents;
  }

  sourceToProcessed(source) {
    return this.getProcessor()
      .use(this.constructor.getCompiler())
      .use(this.compilerPlugins)
      .processSync(source)
      .contents;
  }

  sourceToSyntaxTree(source) {
    return this.getProcessor()
      .parse(source);
  }

  sourceToRedactedSyntaxTree(source) {
    return this.getProcessor()
      .use({ settings: { redact: true } })
      .parse(source);
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
    const mergedSyntaxTree = this.sourceAndRedactedToMergedSyntaxTree(source, redacted);
    return this.getProcessor()
      .use(this.constructor.getCompiler())
      .use(this.compilerPlugins)
      .stringify(mergedSyntaxTree);
  }

  sourceAndRedactedToHtml(source, redacted) {
    const restoredMarkdown = this.sourceAndRedactedToRestored(source, redacted);
    return this.sourceToHtml(restoredMarkdown);
  }

  static getParser() {
    return {
      plugins: [parse],
      settings: {
        commonmark: true,
        pedantic: true
      }
    }
  }

  static getParserPlugins() {
    return [
      restorationRegistration,
      divclass,
      redactedLink,
    ];
  }

  static getCompiler() {
    return stringify;
  }

  static getCompilerPlugins() {
    return [
      div,
      indent,
      rawtext,
    ]
  }

  static create() {
    return new RedactableMarkdownProcessor();
  }
};
