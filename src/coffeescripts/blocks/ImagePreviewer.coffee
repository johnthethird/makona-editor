###* @jsx React.DOM ###

ImagePreviewer = React.createClass
  displayName: "ImagePreviewer"
  render: ->
    `(
      <div className="mk-block-content">
        <img src={this.props.block.data.src} />
      </div>
    )`


module.exports = ImagePreviewer
