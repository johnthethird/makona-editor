`/** @jsx React.DOM */`

QuoteDisplay = React.createClass
  render: ->
    `(
      <div>
        <pre>{this.props.block.data.text}</pre>
        By <i>{this.props.block.data.cite}</i>
      </div>
    )`

module.exports = QuoteDisplay

