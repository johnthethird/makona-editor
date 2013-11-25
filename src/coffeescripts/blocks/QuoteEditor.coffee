`/** @jsx React.DOM */`

QuoteEditor = React.createClass
  handleChange: ->
    text = this.refs.text.getDOMNode().value
    cite = this.refs.cite.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {text: text, cite: cite}})
  render: ->
    `(
      <div>
        <textarea value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>
        <br />
        <input value={this.props.block.data.cite} ref="cite" onChange={this.handleChange} />
      </div>
    )`

module.exports = QuoteEditor
