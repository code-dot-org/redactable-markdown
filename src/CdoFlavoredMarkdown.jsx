const React = require('react')
const PropTypes = require('prop-types');
const ReactMarkdown = require('react-markdown')

const mention = require('./plugins/tip');
const reactPartial = require('./plugins/reactPartial');

const partials = require('./partials/index');

function RedactedLinkRenderer(props) {
  return `[${props.children}]`;
}

function RedactedImageRenderer(props) {
  return `![${props.alt}]`;
}

module.exports = class CdoFlavoredMarkdown extends React.Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
    redacted: PropTypes.bool
  }

  static defaultProps = {
    redacted: false
  }

  getRenderers() {
    if (!this.props.redacted) {
      return partials;
    }

    return {
      link: RedactedLinkRenderer,
      image: RedactedImageRenderer,
    }
  }

  getPlugins() {
    if (!this.props.redacted) {
      return [mention, reactPartial];
    }
  }

  render() {
    return (
      <ReactMarkdown
        escapeHtml
        plugins={this.getPlugins()}
        renderers={this.getRenderers()}
        source={this.props.source}
      />
    );
  }
}
