`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

TextEditor = React.createClass
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = TextEditor
