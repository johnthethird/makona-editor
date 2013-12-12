/** @jsx React.DOM */;
var ExpandingTextarea, TextEditor;

ExpandingTextarea = require("../tags/ExpandingTextarea");

TextEditor = React.createClass({
  render: function() {
    return this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>);
  }
});

module.exports = TextEditor;
