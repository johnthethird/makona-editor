###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

JavascriptEditor = React.createClass
  displayName: "JavascriptEditor"
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = JavascriptEditor
