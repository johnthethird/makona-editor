`/** @jsx React.DOM */`

ImagePreviewer = React.createClass
  render: ->
    `(
      <div>
        <img src={this.props.block.data.src} />
      </div>
    )`


module.exports = ImagePreviewer