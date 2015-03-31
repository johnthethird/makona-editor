###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

QuoteEditor = React.createClass
  displayName: "QuoteEditor"
  handleChange: ->
    cite = this.refs.cite.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {cite: cite}})
  render: ->
    `(
      <div className="mk-block-content" >
        <ExpandingTextarea {...this.props} />
        <br />
        <input value={this.props.block.data.cite} ref="cite" onChange={this.handleChange} />
      </div>
    )`

module.exports = QuoteEditor
