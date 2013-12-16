/** @jsx React.DOM */;
var HtmlPreviewer;

HtmlPreviewer = React.createClass({
  render: function() {
    var html;
    html = this.props.block.data.text;
    return <div dangerouslySetInnerHTML={{__html: html}}></div>;
  }
});

module.exports = HtmlPreviewer;
