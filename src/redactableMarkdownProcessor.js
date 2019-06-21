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

const remarkOptions = {
  commonmark: true,
  pedantic: true
};

module.exports = class RedactableMarkdownProcessor {

  constructor() {
    this.compilerPlugins = this.constructor.getCompilerPlugins();
    this.processor = unified()
      .use(parse, remarkOptions)
      .use(this.constructor.getParserPlugins());
  }

  getProcessor() {
    return this.processor();
  }

  sourceToHtml(source) {
    return this.getProcessor()
      .use(html, remarkOptions)
      .processSync(source)
      .contents;
  }

  sourceToMarkdown(source) {
    return this.getProcessor()
      .use(stringify, remarkOptions)
      .use(this.compilerPlugins)
      .processSync(source)
      .contents;
  }

  sourceToMdast(source) {
    return this.getProcessor()
      .parse(source);
  }

  sourceToRedactedMdast(source) {
    return this.getProcessor()
      .use({ settings: { redact: true } })
      .parse(source);
  }

  sourceToRedacted(source) {
    const sourceTree = this.sourceToRedactedMdast(source);
    return this.getProcessor()
      .use(stringify, remarkOptions)
      .use(renderRedactions)
      .use(this.compilerPlugins)
      .stringify(sourceTree);
  }

  sourceAndRedactedToMergedMdast(source, redacted) {
    const sourceTree = this.sourceToRedactedMdast(source);
    const redactedTree = this.getProcessor()
      .use(restoreRedactions(sourceTree))
      .parse(redacted);

    return redactedTree;
  }

  sourceAndRedactedToMarkdown(source, redacted) {
    const mergedMdast = this.sourceAndRedactedToMergedMdast(source, redacted);
    return this.getProcessor()
      .use(stringify, remarkOptions)
      .use(this.compilerPlugins)
      .stringify(mergedMdast);
  }

  sourceAndRedactedToHtml(source, redacted) {
    const restoredMarkdown = this.sourceAndRedactedToMarkdown(source, redacted);
    return this.sourceToHtml(restoredMarkdown);
  }

  static getParserPlugins() {
    return [
      restorationRegistration,
      divclass,
      redactedLink,
    ];
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
