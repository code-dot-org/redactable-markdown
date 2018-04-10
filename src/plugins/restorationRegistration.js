/**
 * Parser extension required for restoration of redacted content.
 *
 * This extension simply adds the `Parser.prototype.restorationMethods`
 * property, which plugins that implement redaction can use to register the
 * methods required to restore the redacted content.
 *
 * Plugins that implement redaction should implement it by generating a
 * [MDAST Node](https://github.com/syntax-tree/mdast#ast) that implements the
 * Redaction interface:
 *
 *     interface Redaction <: Parent {
 *       type: "redaction";
 *       redactionType: string;
 *     }
 *
 * And which may additionally contain any other properties required to restore
 * the redacted data. Any children of the node will be rendered into the
 * redaction and may be modified by the restoration process
 *
 * @example
 *
 *   // A redacted version of tokenMention as defined at
 *   // https://github.com/remarkjs/remark/tree/master/packages/remark-parse#function-tokenizereat-value-silent
 *   function tokenizeRedactedMention(eat, value, silent) {
 *     var match = /^@(\w+)/.exec(value);
 *
 *     if (match) {
 *       if (silent) {
 *         return true;
 *       }
 *
 *      return eat(match[0])({
 *        type: 'redaction',
 *        redactionType: 'mention',
 *        url: 'https://social-network/' + match[1],  // this content will be redacted
 *        children: [{type: 'text', value: match[0]}] // this content will be rendered
 *      });
 *     }
 *   }
 *
 * Plugins should then register a restoration method by assigning it to the
 * `restorationMethods` object with the same unique `redactionType` value as the
 * generated node. The method should accept three parameters:
 *
 * - [`add`](https://github.com/remarkjs/remark/tree/master/packages/remark-parse#addnode-parent)
 * - `node` - the MDAST Node returned by by redaction
 * - `content` - the modified content, if it exists
 *
 * @example
 *
 *    Parser.prototype.restorationMethods.mention = function (add, node, content) {
 *      return add({
 *        type: 'link',
 *        url: node.url,
 *        children: [{type: 'text', value: content}]
 *      });
 *    }
 *
 * @see restoreRedactions
 */
module.exports = function () {
  const Parser = this.Parser;
  if (!Parser.prototype.restorationMethods) {
    Parser.prototype.restorationMethods = {};
  }
}
