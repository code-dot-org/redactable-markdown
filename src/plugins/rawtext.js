module.exports = function rawtext() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    visitors.rawtext = function (node) {
      return this.encode(node.value, node);
    }
  }
}
