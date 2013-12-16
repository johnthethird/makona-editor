/** @jsx React.DOM */;
var MarkdownPreviewer, marked;

marked = require("marked");

marked.setOptions({
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

MarkdownPreviewer = React.createClass({
  render: function() {
    var html;
    html = marked(this.props.block.data.text);
    return <div dangerouslySetInnerHTML={{__html: html}}></div>;
  }
});

module.exports = MarkdownPreviewer;
