`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

HtmlEditor = React.createClass
  displayName: "HtmlEditor"
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = HtmlEditor
