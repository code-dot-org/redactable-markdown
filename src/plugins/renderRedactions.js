module.exports = function renderRedactions() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    let count = 0;

    visitors.redaction = function redaction(node) {
      let value = "";

      var self = this;
      var exit = self.enterLink();
      if (node.children) {
        value = self.all(node).join('');
      } else if (node.alt) {
        value = self.encode(self.escape(node.alt || '', node))
      }
      exit();

      return `[${value}][${count++}]`;
    }
  }
}

