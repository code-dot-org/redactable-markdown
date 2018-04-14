module.exports.mapMdast = function mapMdast(node) {

  //if (node.type === "rawtext") {
  //  return {
  //    type: "linkReference",
  //    children: [{
  //      type: 'text'
  //    }]
  //  }
  //}

  const result = {
    //type: node.type === 'rawtext' ? 'linkReference' : node.type
    type: node.type
  };

  if (node.children) {
    result.children = node.children.map(child => mapMdast(child));
  }

  //if (node.type === 'rawtext' && !node.children) {
  //  result.children = [{
  //    type: 'text'
  //  }]
  //}

  return result;
}

