module.exports = function redactedUrls() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;
    const originalLink = visitors.link;
    const originalImage = visitors.image;

    const LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;
    const IMAGE_RE = /^!\[([^\]]+)\]\(([^)]+)\)$/;

    visitors.link = function link() {
      const originalResult = originalLink.apply(this, arguments);
      const match = originalResult.match(LINK_RE);
      if (match) {
        return `[${match[1]}]`;
      } else {
        return originalResult
      }
    }

    visitors.image = function image() {
      const originalResult = originalImage.apply(this, arguments);
      const match = originalResult.match(IMAGE_RE);
      if (match) {
        return `![${match[1]}]`;
      } else {
        return originalResult
      }
    }
  }
}
