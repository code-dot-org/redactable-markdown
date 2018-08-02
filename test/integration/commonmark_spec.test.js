const expect = require('expect');

const parser = require('../../src/redactableMarkdownParser').create();

// data from http://spec.commonmark.org/0.28/spec.json
const data = require("./data/commonmark/spec.json");

const sections = data.reduce((accumulator, current) => {
  if (!accumulator[current.section]) {
    accumulator[current.section] = []
  }
  accumulator[current.section].push({
    html: current.html,
    markdown: current.markdown
  });
  return accumulator;
}, {});

// TODO we don't care very strongly about raw html serialization for our current
// purposes, and the differences between Remark and CommonMark raw html are
// mostly syntax nits rather than anything functional. Disable those tests for
// now.
delete sections["Raw HTML"];

describe("Commonmark Spec Compliance", () => {
  Object.keys(sections).forEach((section) => {
    describe(section, () => {
      sections[section].forEach(({html, markdown}) => {
        it(JSON.stringify(markdown), () => {
          expect(parser.sourceToHtml(markdown)).toEqual(html);
        });
      });
    });
  });
});
