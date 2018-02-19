module.exports = function mergeMdast(sourceTree, redactedTree) {
  const sourceLinks = [];
  function getSourceLinks(node) {
    if (node.type === "link" || node.type === "image") {
      sourceLinks.push(node.url);
    }

    if (node.children) {
      node.children.forEach(getSourceLinks);
    }
  }
  getSourceLinks(sourceTree);

  sourceLinks.forEach(function (link, i) {
    redactedTree.children.push({
      identifier: `redactedUrlReference-${i}`,
      type: "definition",
      url: link
    });
  });
}
