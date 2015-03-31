###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

TextEditor = React.createClass
  displayName: "TextEditor"
  render: -> `<ExpandingTextarea {...this.props} />`

module.exports = TextEditor
