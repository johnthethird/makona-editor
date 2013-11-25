/** @jsx React.DOM */;
var MarkdownDisplay, SHOWDOWN_CONVERTER;

SHOWDOWN_CONVERTER = new Showdown.converter();

MarkdownDisplay = React.createClass({
  render: function() {
    var html;
    html = SHOWDOWN_CONVERTER.makeHtml(this.props.block.data.text);
    return React.DOM.div( {dangerouslySetInnerHTML:{__html: html}});
  }
});

module.exports = MarkdownDisplay;
