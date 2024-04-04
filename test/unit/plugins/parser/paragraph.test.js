import { expect } from "@jest/globals";
const processor =
  require("../../../../src/redactableMarkdownProcessor").create();

describe("paragraph", () => {
  describe("render", () => {
    it("renders paragraphs separated by < 4 spaces as two paragraphs", () => {
      for (let i = 0; i < 4; i++) {
        const input = `First Paragraph\n${" ".repeat(i)}\nSecondParagraph`;
        const output = processor.sourceToHtml(input);
        expect(output).toEqual(
          "<p>First Paragraph</p>\n<p>SecondParagraph</p>",
        );
      }
    });
    it("renders paragraphs separated by >= 4 spaces as two paragraphs", () => {
      for (let i = 4; i < 20; i++) {
        const input = `First Paragraph\n${" ".repeat(i)}\nSecondParagraph`;
        const output = processor.sourceToHtml(input);
        expect(output).toEqual(
          "<p>First Paragraph</p>\n<p>SecondParagraph</p>",
        );
      }
    });
  });
});
