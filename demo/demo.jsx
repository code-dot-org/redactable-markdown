const React = require('react');
const ReactDOM = require('react-dom');

const processor = require('../src/redactableMarkdownProcessor').create();

//const initialMarkdown = require('./cdo-markdown.md');
const initialMarkdown = "This is some text with [a link](http://first.com) and ![an image](http://second.com/img.jpg).\n\nAnd also a second paragraph with [another link](http://third.com)";

class Demo extends React.Component {
  constructor() {
    super();
    this.state = {
      sourceMarkdown: initialMarkdown,
      redactedMarkdown: processor.sourceToRedacted(initialMarkdown),
    };
  }

  handleSourceChange = e => {
    this.setState({
      sourceMarkdown: e.target.value,
    });
  };

  handleRedactedChange = e => {
    this.setState({
      redactedMarkdown: e.target.value,
    });
  };

  redact = () => {
    this.setState({
      redactedMarkdown: processor.sourceToRedacted(
        this.state.sourceMarkdown,
      ),
    });
  };

  styles = {
    textarea: {
      width: '50%',
      boxSizing: 'border-box',
      height: 200,
    },
    renderContainer: {
      border: '1px solid black',
      float: 'left',
      width: '50%',
      boxSizing: 'border-box',
      padding: 10,
      marginTop: 4,
    },
    buttonContainer: {
      width: '100%',
      textAlign: 'center',
    },
  };

  render() {
    return (
      <div>
        <textarea
          style={this.styles.textarea}
          value={this.state.sourceMarkdown}
          onChange={this.handleSourceChange}
        />
        <textarea
          style={this.styles.textarea}
          value={this.state.redactedMarkdown}
          onChange={this.handleRedactedChange}
        />
        <div style={this.styles.buttonContainer}>
          <button onClick={this.redact}>&rarr; Redact &rarr;</button>
        </div>
        <div
          style={this.styles.renderContainer}
          dangerouslySetInnerHTML={{
            __html: processor.sourceToHtml(this.state.sourceMarkdown)
          }}
        />
        <div
          style={this.styles.renderContainer}
          dangerouslySetInnerHTML={{
            __html: processor.sourceAndRedactedToHtml(
                this.state.sourceMarkdown,
                this.state.redactedMarkdown,
              )
          }}
        />
      </div>
    );
  }
}

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Demo />, container);
