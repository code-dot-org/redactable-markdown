const React = require('react')
const PropTypes = require('prop-types');
const ReactMarkdown = require('react-markdown')

const cdoFlavoredParser = require('./cdoFlavoredParser');

module.exports = class CdoFlavoredMarkdown extends React.Component {
  static propTypes = {
    source: PropTypes.string.isRequired,
  }

  getPlugins() {
    return cdoFlavoredParser.getPlugins();
  }

  render() {
    return (
      <ReactMarkdown
        escapeHtml={false}
        plugins={this.getPlugins()}
        source={this.props.source}
      />
    );
  }
}
