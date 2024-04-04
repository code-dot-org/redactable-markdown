import { expect } from "@jest/globals";
const { resourceLink } = require("@code-dot-org/remark-plugins");

const processor =
  require("../../../../src/redactableMarkdownProcessor").create();

processor.parserPlugins.push(resourceLink);

describe("resourceLink", () => {
  describe("render", () => {
    it("cannot render resourceLinks to html", () => {
      const input = "[r some-slug/course-offering/1999]";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual("<p>[r some-slug/course-offering/1999]</p>");
    });
  });

  describe("redact", () => {
    it("redacts resourceLinks", () => {
      const input = "[r some-slug/course-offering/1999]";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual("[some-slug][0]\n");
    });
  });

  describe("restore", () => {
    it("can restore resourceLinks back to markdown", () => {
      const source = "[r some-slug/course-offering/1999]";
      const redacted = "[any-text][0]";
      const output = processor.sourceAndRedactedToRestored(source, redacted);
      expect(output).toEqual("[r some-slug/course-offering/1999]\n");
    });

    it("can only restore resourceLinks to HTML by rendering the raw syntax", () => {
      // see the comment on the plugin definition for more context as to why
      // this is true
      const source = "[r some-slug/course-offering/1999]";
      const redacted = "[any-text][0]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>[r some-slug/course-offering/1999]</p>");
    });
  });
});
