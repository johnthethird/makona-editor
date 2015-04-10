###* @jsx React.DOM ###

TextPreviewer = React.createClass
  displayName: "TextPreviewer"
  propTypes:
    block: React.PropTypes.object.isRequired
  render: -> `<pre>{this.props.block.data.text}</pre>`

module.exports = TextPreviewer
