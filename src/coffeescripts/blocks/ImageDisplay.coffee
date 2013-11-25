`/** @jsx React.DOM */`

ImageDisplay = React.createClass
  render: ->
    `(
      <div>
        <img src={this.props.block.data.src} />
      </div>
    )`


module.exports = ImageDisplay