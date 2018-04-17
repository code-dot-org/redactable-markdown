const html = require('remark-html');
const parse = require('remark-parse');
const stringify = require('remark-stringify');
const unified = require('unified');

// process plugins
const renderRedactions = require('./plugins/renderRedactions');
const restoreRedactions = require('./plugins/restoreRedactions');
const restorationRegistration = require('./plugins/restorationRegistration');

// compiler plugins
const rawtext = require('./plugins/rawtext');

// parser plugins
const divclass = require('./plugins/divclass');
const redactedLink = require('./plugins/redactedLink');
const resourcelink = require('./plugins/resourcelink');
const tiplink = require('./plugins/tiplink');
const vocablink = require('./plugins/vocablink');

module.exports = class CdoFlavoredParser {
  static getPlugins = function() {
    return this.getParserPlugins().concat(this.getCompilerPlugins());
  }

  static getParserPlugins = function() {
    return [
      restorationRegistration,
      divclass,
      redactedLink,
      resourcelink,
      tiplink,
      vocablink,
    ];
  };

  static getCompilerPlugins = function() {
    return [
      rawtext,
    ]
  }

  static getParser = function() {
    return unified()
      .use(parse)
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
