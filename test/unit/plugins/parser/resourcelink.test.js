const expect = require("expect");
const processor = require("../../../../src/redactableMarkdownProcessor").create();
const resourcelinkPlugin = require("./resourcelink");
processor.processor.use(resourcelinkPlugin);

describe("resourcelink", () => {
  describe("render", () => {
    it("cannot render resourcelinks to html", () => {
      const input = "[r some-slug]";
      const output = processor.sourceToHtml(input);
      expect(output).toEqual("<p>[r some-slug]</p>\n");
    });
  });

  describe("redact", () => {
    it("redacts resourcelinks", () => {
      const input = "[r some-slug]";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual("[some-slug][0]\n");
    });
  });

  describe("restore", () => {
    it("can restore resourcelinks back to markdown", () => {
      const source = "[r some-slug]";
      const redacted = "[any-text][0]";
      const output = processor.sourceAndRedactedToRestored(source, redacted);
      expect(output).toEqual("[r some-slug]\n");
    });

    it("can only restore resourcelinks to HTML by rendering the raw syntax", () => {
      // see the comment on the plugin definition for more context as to why
      // this is true
      const source = "[r some-slug]";
      const redacted = "[any-text][0]";
      const output = processor.sourceAndRedactedToHtml(source, redacted);
      expect(output).toEqual("<p>[r some-slug]</p>\n");
    });
  });
});
