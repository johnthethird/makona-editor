/** @jsx React.DOM */;
var MarkdownPreviewer, SHOWDOWN_CONVERTER;

SHOWDOWN_CONVERTER = new Showdown.converter();

MarkdownPreviewer = React.createClass({
  render: function() {
    var html;
    html = SHOWDOWN_CONVERTER.makeHtml(this.props.block.data.text);
    return <div dangerouslySetInnerHTML={{__html: html}}></div>;
  }
});

module.exports = MarkdownPreviewer;
