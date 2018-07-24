/**
 * Normally, div elements are not renderable into markdown since there is no
 * vanilla markdown syntax that produces divs; but with the divclass syntax, we
 * should be able to serialize into markdown divs that have classes:
 *
 *   <div class="some-string">
 *     {html-formatted content}
 *   </div>
 * 
 * should serialize to (and be produced from):
 *
 *   [some-string]
 *
 *   {markdown-formatted content}
 *
 *   [/some-string]
 *
 * @see plugins/parser/divclass
 */
module.exports = function div() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    visitors.div = function (node) {
      const className = node.data.hProperties.className;
      
      return [
        `[${className}]`,
        this.block(node),
        `[/${className}]`
      ].join("\n\n");
    }
  }
}
