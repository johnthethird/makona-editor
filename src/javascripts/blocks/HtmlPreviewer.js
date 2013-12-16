/** @jsx React.DOM */;
var HtmlPreviewer;

HtmlPreviewer = React.createClass({
  render: function() {
    var html;
    html = this.props.block.data.text;
    return React.DOM.div( {dangerouslySetInnerHTML:{__html: html}});
  }
});

module.exports = HtmlPreviewer;
