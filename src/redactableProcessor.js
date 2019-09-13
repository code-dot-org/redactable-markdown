const unified = require("unified");
const {
  redact,
  restore,
  parseRestorations,
  renderRestorations
} = require("remark-redactable");
const plugins = require("@code-dot-org/remark-plugins");

const TextParser = require("./plugins/parser/TextParser");
const TextCompiler = require("./plugins/compiler/TextCompiler");

const selectAll = require("unist-util-select").selectAll;
const select = require("unist-util-select").select;

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

  redactedToSyntaxTree(redacted, strict) {
    var parser = unified()
      .use(this.constructor.getParser())
      .use(parseRestorations);
    if (strict) {
      parser.use(redact);
    }
    parser.use(this.parserPlugins);
    return parser.parse(redacted);
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
  checkRestorationNodes(sourceTree, restorationTree, mergedTree) {
    // If the restoration tree has any redacted content then redactable content was added so return false.
    if (select("blockRedaction,inlineRedaction", restorationTree)) {
      return false;
    }

    // Check that we found as many restorations as redactions
    const expectedRedactions = selectAll(
      "blockRedaction,inlineRedaction",
      sourceTree
    );
    const expectedRestorations = selectAll(
      "blockRestoration,inlineRestoration",
      restorationTree
    );
    if (expectedRedactions.length !== expectedRestorations.length) {
      return false;
    }

    // Finally, check that no content was unrestored.
    if (select("blockRestoration,inlineRestoration", mergedTree)) {
      return false;
    }

    return true;
  }

  sourceAndRedactedToMergedSyntaxTree(sourceTree, restorationTree) {
    const restorationMethods = this.parserPlugins
      .map(plugin => plugin.restorationMethods)
      .reduce((acc, val) => Object.assign({}, acc, val), {});
    // pass in a deep copy of the tree to keep the restorationTree
    const treeToTransform = JSON.parse(JSON.stringify(restorationTree));
    const mergedTree = unified()
      .use(restore, sourceTree, restorationMethods)
      .runSync(treeToTransform);

    return mergedTree;
  }

  sourceAndRedactedToRestored(source, redacted, strict) {
    const sourceTree = this.sourceToRedactedSyntaxTree(source);
    const restorationTree = this.redactedToSyntaxTree(redacted, strict);
    const mergedSyntaxTree = this.sourceAndRedactedToMergedSyntaxTree(
      sourceTree,
      restorationTree
    );
    if (strict) {
      const valid = this.checkRestorationNodes(
        sourceTree,
        restorationTree,
        mergedSyntaxTree
      );
      if (!valid) {
        return "";
      }
    }
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
