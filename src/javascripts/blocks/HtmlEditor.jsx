/** @jsx React.DOM */;
var ExpandingTextarea, HtmlEditor;

ExpandingTextarea = require("../tags/ExpandingTextarea");

HtmlEditor = React.createClass({
  render: function() {
    return this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>);
  }
});

module.exports = HtmlEditor;
