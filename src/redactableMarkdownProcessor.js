const unified = require("unified");
const remarkRehype = require("remark-rehype");
const rehypeRaw = require("rehype-raw");
const rehypeSanitize = require("rehype-sanitize");
const rehypeStringify = require("rehype-stringify");
const remarkParse = require("remark-parse");
const remarkStringify = require("remark-stringify");
const plugins = require("@code-dot-org/remark-plugins");
const defaultSanitizationSchema = require("hast-util-sanitize/lib/github");

const RedactableProcessor = require("./redactableProcessor");

// create custom sanitization schema as per
// https://github.com/syntax-tree/hast-util-sanitize#schema
// to support our custom syntaxes
const schema = Object.assign({}, defaultSanitizationSchema);
schema.clobber = [];

// We use a _lot_ of image formatting stuff in our
// instructions, particularly in CSP
schema.attributes.img.push("height", "width");

// Add support for expandableImages
schema.tagNames.push("span");
schema.attributes.span = ["dataUrl", "className"];

// Add support for inline styles (gross)
// TODO replace all inline styles in our curriculum content with
// semantically-significant content
schema.attributes["*"].push("style", "className");

// ClickableText uses data-id on a bold tag.
schema.attributes["b"] = ["dataId"];

// Add support for Blockly XML
const blocklyTags = [
  "block",
  "functional_input",
  "mutation",
  "next",
  "statement",
  "title",
  "field",
  "value",
  "xml",
];
schema.tagNames = schema.tagNames.concat(blocklyTags);

module.exports = class RedactableMarkdownProcessor extends RedactableProcessor {
  constructor() {
    super();
    this.compilerPlugins.push(plugins.div, plugins.indent);
    this.parserPlugins.push(plugins.divclass, plugins.link);
  }

  sourceToHtml(source) {
    return unified()
      .use(this.constructor.getParser())
      .use(remarkRehype, { allowDangerousHTML: true })
      .use(rehypeRaw)
      .use(rehypeSanitize, schema)
      .use(rehypeStringify)
      .use(this.parserPlugins)
      .use(this.compilerPlugins)
      .processSync(source).contents;
  }

  sourceAndRedactedToHtml(source, redacted, strict) {
    const restoredMarkdown = this.sourceAndRedactedToRestored(
      source,
      redacted,
      strict,
    );
    return this.sourceToHtml(restoredMarkdown);
  }

  /**
   * @override
   */
  static getParser() {
    return {
      plugins: [remarkParse],
      settings: {
        commonmark: true,
        pedantic: true,
      },
    };
  }

  /**
   * @override
   */
  static getCompiler() {
    return remarkStringify;
  }

  /**
   * @override
   */
  static create() {
    return new RedactableMarkdownProcessor();
  }
};
