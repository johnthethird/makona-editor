`/** @jsx React.DOM */`

TextPreviewer = React.createClass
  render: -> `<pre>{this.props.block.data.text}</pre>`

module.exports = TextPreviewer
