const expect = require('expect');
const fs = require('fs');
const path = require('path');

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

describe("Commonmark Spec Compliance", () => {
  Object.keys(sections).forEach((section) => {
    describe(`complies with spec for ${section} section`, () => {
      //let exampleCount = 0;
      //let passedCount = 0;
      sections[section].forEach(({html, markdown}) => {
        it(markdown, () => {
          expect(parser.sourceToHtml(markdown)).toEqual(html);
        });
        //exampleCount += 1;
        //if (html === parser.sourceToHtml(markdown)) {
        //  passedCount += 1;
        //}
      });

      //expect(passedCount).toEqual(exampleCount);
    });
  });
});
