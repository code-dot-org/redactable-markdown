const expect = require("expect");
const { vocabularyDefinition } = require("@code-dot-org/remark-plugins");

const processor =
  require("../../../../src/redactableMarkdownProcessor").create();

processor.parserPlugins.push(vocabularyDefinition);

describe("vocabularyDefinition", () => {
  describe("render", () => {
    it("can only render vocabularyDefinitions back out to plain text", () => {
      const input = "[v some_word/course-offering/1999]";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual("<p>[v some_word/course-offering/1999]</p>\n");
    });
  });

  describe("redact", () => {
    it("redacts vocabularyDefinitions", () => {
      const input = "[v some_word/course-offering/1999]";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual("[some\\_word][0]\n");
    });
  });

  describe("restore", () => {
    it("can restore vocabularyDefinitions back to markdown", () => {
      const source = "[v some_word/course-offering/1999]";
      const redacted = "[un_mot][0]";
      const output = processor.sourceAndRedactedToRestored(source, redacted);
      expect(output).toEqual("[v some_word/course-offering/1999]\n");
    });
  });
});
