`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

HtmlEditor = React.createClass
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = HtmlEditor
