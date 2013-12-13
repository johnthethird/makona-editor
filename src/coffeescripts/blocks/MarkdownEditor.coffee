`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

MarkdownEditor = React.createClass
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = MarkdownEditor
