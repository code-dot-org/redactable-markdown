module.exports = function () {
  const Parser = this.Parser;
  if (!Parser.prototype.restorationMethods) {
    Parser.prototype.restorationMethods = {};
  }
}
