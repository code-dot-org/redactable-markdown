/**
 * Duplicate the changes in https://github.com/remarkjs/remark/pull/344 until a
 * version of remark-stringify is released that includes those changes.
 */
module.exports = function betterPedanticEmphasis() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;

    visitors.emphasis = function (node) {
        let marker = this.options.emphasis;
        const content = this.all(node).join('');

        /* When in pedantic mode, prevent using underscore as the marker when
        * there are underscores in the content.
        */
        if (
          this.options.pedantic &&
          marker === '_' &&
          content.indexOf(marker) !== -1
        ) {
          marker = '*';
        }

      return marker + content + marker;
    }
  }
}
