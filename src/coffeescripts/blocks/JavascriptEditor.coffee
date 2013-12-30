`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

JavascriptEditor = React.createClass
  render: -> `this.transferPropsTo(<ExpandingTextarea></ExpandingTextarea>)`

module.exports = JavascriptEditor
