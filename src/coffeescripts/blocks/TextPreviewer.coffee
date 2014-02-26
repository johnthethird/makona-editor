###* @jsx React.DOM ###

TextPreviewer = React.createClass
  displayName: "TextPreviewer"
  render: -> `<pre>{this.props.block.data.text}</pre>`

module.exports = TextPreviewer
