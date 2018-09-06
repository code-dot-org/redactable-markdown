const html = require('remark-html');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const unified = require('unified');

const renderRedactions = require('./plugins/process/renderRedactions');
const restoreRedactions = require('./plugins/process/restoreRedactions');
const restorationRegistration = require('./plugins/process/restorationRegistration');

const betterPedanticEmphasis = require('./plugins/compiler/betterPedanticEmphasis');
const div = require('./plugins/compiler/div');
const indent = require('./plugins/compiler/indent');
const rawtext = require('./plugins/compiler/rawtext');

const divclass = require('./plugins/parser/divclass');
const paragraph = require('./plugins/parser/paragraph');
const redactedLink = require('./plugins/parser/redactedLink');

const remarkOptions = {
  commonmark: true,
  pedantic: true
};

module.exports = class RedactableMarkdownParser {

  constructor() {
    this.compilerPlugins = this.constructor.getCompilerPlugins();
    this.parser = unified()
      .use(parse, remarkOptions)
      .use(this.constructor.getParserPlugins());
  }

  getParser() {
    return this.parser();
  }

  sourceToHtml(source) {
    return this.getParser()
      .use(html, remarkOptions)
      .processSync(source)
      .contents;
  }

  sourceToMarkdown(source) {
    return this.getParser()
      .use(stringify, remarkOptions)
      .use(this.compilerPlugins)
      .processSync(source)
      .contents;
  }

  sourceToMdast(source) {
    return this.getParser()
      .parse(source);
  }

  sourceToRedactedMdast(source) {
    return this.getParser()
      .use({ settings: { redact: true } })
      .parse(source);
  }

  sourceToRedacted(source) {
    const sourceTree = this.sourceToRedactedMdast(source);
    return this.getParser()
      .use(stringify, remarkOptions)
      .use(renderRedactions)
      .use(this.compilerPlugins)
      .stringify(sourceTree);
  }

  sourceAndRedactedToMergedMdast(source, redacted) {
    const sourceTree = this.sourceToRedactedMdast(source);
    const redactedTree = this.getParser()
      .use(restoreRedactions(sourceTree))
      .parse(redacted);

    return redactedTree;
  }

  sourceAndRedactedToMarkdown(source, redacted) {
    const mergedMdast = this.sourceAndRedactedToMergedMdast(source, redacted);
    return this.getParser()
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
      paragraph,
      redactedLink,
    ];
  }

  static getCompilerPlugins() {
    return [
      betterPedanticEmphasis,
      div,
      indent,
      rawtext,
    ]
  }

  static create() {
    return new RedactableMarkdownParser();
  }
};
