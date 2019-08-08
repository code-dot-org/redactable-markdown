/**
 * Indent the children of this node with four spaces. The product will be simiar
 * to the syntax for indented code, but will never be fenced or annonated, and
 * this node will actually stringify its children (unlike the code node which
 * simply indents a given value string)
 *
 * Note that this plugin could easily be updated to override the default
 * indentation character and/or level of indentation.
 *
 * @see plugins/parser/tip
 */
module.exports = function indent() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    if (visitors) {
      visitors.indent = function(node) {
        const indentation = "    ";
        const newline = "\n";
        return this.all(node)
          .map(
            child =>
              indentation + child.split(newline).join(newline + indentation)
          )
          .join(newline + newline);
      };
    }
  }
};
