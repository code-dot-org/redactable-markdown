const expect = require("expect");
const Processor = require("../../src/redactableProcessor");

const divclass = require("../../src/plugins/parser/divclass");

describe("Redaction and Restoration without other syntax", () => {
  let processor;
  beforeEach(() => {
    processor = Processor.create();
  });

  describe("render", () => {
    it("does not process markdown syntax", () => {
      const input = "This is some text with [a link](http://example.com)";
      const output = processor.sourceToProcessed(input);
      expect(output).toEqual(input);
    });

    it("DOES STILL NORMALIZE NEWLINES", () => {
      // TODO elijah this should ideally not be true
      const testCases = [
        "single trailing newline\n",
        "lots of trailing newlines\n\n",
        "lots\n\n\nof\nintermediate\n\nnewlines"
      ];
      testCases.forEach(testCase => {
        const output = processor.sourceToProcessed(testCase);
        expect(output).not.toEqual(testCase);
      });
    });
  });

  describe("redact", () => {
    it("redacts nothing by default", () => {
      const input = "This is some text with [a link](http://example.com)";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual(input);
    });

    it("will redact only syntax that is explicitly specified", () => {
      const input =
        "Some content with\n\n[classname]\n\na divclass\n\n[/classname]";
      const standard = processor.sourceToRedacted(input);
      expect(standard).toEqual(input);

      processor.processor.use(divclass);
      const special = processor.sourceToRedacted(input);
      const redacted = "Some content with\n\n[][0]\n\na divclass\n\n[/][0]";
      expect(special).toEqual(redacted);
    });

    it("will not escape markdown syntax as a side effect of redaction", () => {
      const input =
        "Some text with an_underscore that would normally get escaped";
      const output = processor.sourceToRedacted(input);
      expect(output).toEqual(input);
    });
  });

  describe("restore", () => {
    it("can restore", () => {
      const source =
        "Some content with\n\n[classname]\n\na divclass\n\n[/classname]";
      const redacted =
        "du contenu avec\n\n[][0]\n\nune classe de classe\n\n[/][0]";
      const expected =
        "du contenu avec\n\n[classname]\n\nune classe de classe\n\n[/classname]";
      processor.processor.use(divclass);
      const restored = processor.sourceAndRedactedToRestored(source, redacted);
      expect(restored).toEqual(expected);
    });

    it("will not escape markdown syntax as a side effect of restoration", () => {
      const input =
        "Some text with an_underscore that would normally get escaped";
      const output = processor.sourceAndRedactedToRestored(input, input);
      expect(output).toEqual(input);
    });
  });
});
