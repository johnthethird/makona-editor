###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

TextEditor = React.createClass
  displayName: "TextEditor"
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = TextEditor
