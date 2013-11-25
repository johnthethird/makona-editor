`/** @jsx React.DOM */`

MarkdownEditor = React.createClass
  handleChange: ->
    text = this.refs.text.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {text: text}})
  render: -> `<textarea value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>`

module.exports = MarkdownEditor
