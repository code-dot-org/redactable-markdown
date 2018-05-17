const html = require('remark-html');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const unified = require('unified');

const renderRedactions = require('./plugins/process/renderRedactions');
const restoreRedactions = require('./plugins/process/restoreRedactions');
const restorationRegistration = require('./plugins/process/restorationRegistration');

const indent = require('./plugins/compiler/indent');
const rawtext = require('./plugins/compiler/rawtext');

const attrlist = require('./plugins/parser/attrlist');
const divclass = require('./plugins/parser/divclass');
const redactedLink = require('./plugins/parser/redactedLink');
const resourcelink = require('./plugins/parser/resourcelink');
const tip = require('./plugins/parser/tip');
const tiplink = require('./plugins/parser/tiplink');
const vocablink = require('./plugins/parser/vocablink');

module.exports = class CdoFlavoredParser {
  static getPlugins = function() {
    return this.getParserPlugins().concat(this.getCompilerPlugins());
  }

  static getParserPlugins = function() {
    return [
      restorationRegistration,
      attrlist,
      divclass,
      redactedLink,
      resourcelink,
      tip,
      tiplink,
      vocablink,
    ];
  };

  static getCompilerPlugins = function() {
    return [
      indent,
      rawtext,
    ]
  }

  static getParser = function() {
    return unified()
      .use(parse, {
        commonmark: true,
        pedantic: true
      })
      .use(this.getParserPlugins());
  };

  static sourceToHtml = function(source) {
    return this.getParser()
      .use(html)
      .processSync(source)
      .contents;
  };

  static sourceToRedactedMdast = function(source) {
    return this.getParser()
      .use({ settings: { redact: true } })
      .parse(source);
  };

  static sourceToRedacted = function(source) {
    const sourceTree = this.sourceToRedactedMdast(source);
    return this.getParser()
      .use(stringify)
      .use(renderRedactions)
      .stringify(sourceTree);
  };

  static sourceAndRedactedToMergedMdast = function(source, redacted) {
    const sourceTree = this.sourceToRedactedMdast(source);
    const redactedTree = this.getParser()
      .use(restoreRedactions(sourceTree))
      .parse(redacted);

    return redactedTree;
  };

  static sourceAndRedactedToMarkdown = function(source, redacted) {
    const mergedMdast = this.sourceAndRedactedToMergedMdast(source, redacted);
    return this.getParser()
      .use(stringify)
      .use(this.getCompilerPlugins())
      .stringify(mergedMdast);
  };

  static sourceAndRedactedToHtml = function(source, redacted) {
    const restoredMarkdown = this.sourceAndRedactedToMarkdown(source, redacted);
    return this.sourceToHtml(restoredMarkdown);
  };
};
