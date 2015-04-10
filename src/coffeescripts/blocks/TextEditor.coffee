###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

TextEditor = React.createClass
  displayName: "TextEditor"
  propTypes:
    block: React.PropTypes.object.isRequired

  render: -> `<ExpandingTextarea {...this.props} />`

module.exports = TextEditor
