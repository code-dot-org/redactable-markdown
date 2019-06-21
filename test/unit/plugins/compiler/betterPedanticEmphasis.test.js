/**
 * @fileoverview duplicate the tests in https://github.com/remarkjs/remark/pull/344
 */

const expect = require('expect');
const processor = require('../../../../src/redactableMarkdownProcessor').create();

describe('pedantic emphasis', () => {
  it('should handle underscores in emphasis in pedantic mode', () => {
    const example = '*alpha_bravo*\n';
    expect(processor.sourceToProcessed(example)).toEqual('*alpha\\_bravo*\n');
  });

  describe('emphasis in pedantic mode should support a constiety of contained inline content', () => {
    /* Data-driven tests in the format: [name, input, expected] */
    const tests = [
      ['words with asterisks', '*inner content*', '_inner content_\n'],
      ['words with underscores', '_inner content_', '_inner content_\n'],
      ['links', '*[](http://some_url.com)*', '*[](http://some_url.com)*\n'],
      ['underscores inside asterisks', '*inner content _with_ emphasis*', '*inner content _with_ emphasis*\n'],
      ['asterisks inside underscores', '_inner content *with* emphasis_', '*inner content _with_ emphasis*\n'],
      ['images', '*![](http://some_url.com/img.jpg)*', '*![](http://some_url.com/img.jpg)*\n'],
      ['inline code with asterisks', '*content `with` code*', '_content `with` code_\n'],
      ['inline code with underscores', '_content `with` code_', '_content `with` code_\n']
    ];
    tests.forEach(function (test) {
      it(test[0], () => {
        expect(processor.sourceToProcessed(test[1])).toEqual(test[2]);
      });
    });
  });
});
