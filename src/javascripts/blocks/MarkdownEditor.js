/** @jsx React.DOM */;
var ExpandingTextarea, MarkdownEditor;

ExpandingTextarea = require("../tags/ExpandingTextarea");

MarkdownEditor = React.createClass({
  render: function() {
    return this.transferPropsTo(ExpandingTextarea(null));
  }
});

module.exports = MarkdownEditor;
