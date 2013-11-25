`/** @jsx React.DOM */`

TextDisplay = React.createClass
  render: -> `<pre>{this.props.block.data.text}</pre>`

module.exports = TextDisplay
