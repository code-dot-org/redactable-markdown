const React = require('react')
const expect = require('expect');
const mount = require('enzyme').mount;

const CdoFlavoredMarkdown = require('../../src/CdoFlavoredMarkdown');

describe('Basic Markdown', () => {
  it('renders a variety of inline elements', () => {
    const input = '# This is a header\n\nAnd this is a paragraph'
    const output = mount(<CdoFlavoredMarkdown source={input} />);
    expect(output.find('h1')).toHaveLength(1);
    expect(output.find('h1').text()).toEqual("This is a header");
    expect(output.find('p')).toHaveLength(1)
    expect(output.find('p').text()).toEqual("And this is a paragraph");
  });

  it('will not convert markdown to html when in render mode', () => {
    const input = "# This is a header\n\nAnd this is a paragraph";
    const output = mount(<CdoFlavoredMarkdown source={input} redacted />);
    expect(output.find('img')).toHaveLength(0);
    expect(output.find('a')).toHaveLength(0);
    expect(output.text()).toEqual("This is a headerAnd this is a paragraph");
  });

  it('renders links and images by default', () => {
    const input = "This [is](/foo/bar) some markdown [with links](http://example.net) and ![images](http://example.net/foo.jpg)";
    const output = mount(<CdoFlavoredMarkdown source={input} />);
    expect(output.find('img')).toHaveLength(1);
    expect(output.find('a')).toHaveLength(2);
    expect(output.text()).toEqual("This is some markdown with links and ");
  });

  //it('will not render the content of links and images when in redact mode', () => {
  //  const input = "This [is](/foo/bar) some markdown [with links](http://example.net) and ![images](http://example.net/foo.jpg)";
  //  const output = mount(<CdoFlavoredMarkdown source={input} redacted />);
  //  expect(output.find('img')).toHaveLength(0);
  //  expect(output.find('a')).toHaveLength(0);
  //  expect(output.text()).toEqual("This [is] some markdown [with links] and ![images]");
  //});

  //it('does not render html', () => {
  //  const input = "This is some markdown <strong>with embedded html</strong>\n\n<stript src='foo'/>\n\n<div id='bar'>Both inline and block</div>";
  //  const output = mount(<CdoFlavoredMarkdown source={input} />);
  //  expect(output.find('strong')).toHaveLength(0);
  //  expect(output.find('script')).toHaveLength(0);
  //  expect(output.find('#bar')).toHaveLength(0);
  //  expect(output.text()).toEqual(input.replace(/\n/g, ''));
  //});
});

//describe('Custom Markdown', () => {
//  it('renders mentions', () => {
//    const input = "This is some markdown with @a_name";
//    const output = mount(<CdoFlavoredMarkdown source={input} />);
//    expect(output.find('a')).toHaveLength(1);
//    expect(output.find('a').props().href).toEqual("https://social-network/a_name");
//    expect(output.text()).toEqual(input.replace(/\n/g, ''));
//  });

//  it('renders react partials', () => {
//    const input = "This input has a\n\n<CustomPartial\n"
//    const output = mount(<CdoFlavoredMarkdown source={input} />);
//    expect(output.text()).toEqual("This input has aCustom Partial, yay!");
//    expect(output.find('CustomPartial')).toHaveLength(1);
//  });

//  it('does not render any custom markdown in redacted', () => {
//  });
//});
