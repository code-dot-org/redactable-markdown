/**
 * Walk a MDAST and return a "map" that includes just the hierarchy and types of
 * nodes, but none of the inner content of those nodes. Can be used to easily
 * compare, for example, two trees which represent the same basic content in two
 * different languages, and verify that they produce the same basic HTML
 * structure.
 */
module.exports.mapMdast = function mapMdast(node) {

  const result = {
    type: node.type
  };

  if (node.children) {
    result.children = node.children.map(child => mapMdast(child));
  }

  return result;
}

