`/** @jsx React.DOM */`

ImagePreviewer = React.createClass
  displayName: "ImagePreviewer"
  render: ->
    `(
      <div>
        <img src={this.props.block.data.src} />
      </div>
    )`


module.exports = ImagePreviewer