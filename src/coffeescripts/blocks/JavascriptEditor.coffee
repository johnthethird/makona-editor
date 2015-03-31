###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

JavascriptEditor = React.createClass
  displayName: "JavascriptEditor"
  render: -> `<ExpandingTextarea {...this.props} />`

module.exports = JavascriptEditor
