`/** @jsx React.DOM */`

UnknownPreviewer = React.createClass
  render: -> `<div><h4>Unknown Block Type: {this.props.block.type}</h4><pre>{JSON.stringify(this.props.block.data, null, 2)}</pre></div>`

module.exports = UnknownPreviewer
