###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################
ImagePreviewer = require("./ImagePreviewer")

ImageEditor = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "ImageEditor"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div>
        { (this.props.block.data.src.length > 0) ? <ImagePreviewer block={this.props.block} /> : <div ref='fineuploader'></div>}
      </div>
    )`


  ##############################
  ### Life Cycle             ###
  ##############################
  # componentWillMount
  # componentWillReceiveProps
  # componentWillUpdate
  # componentDidUpdate

  componentDidMount: () ->

  # Dont ever update, as we dont need to. When the state is reset with uploaded image src, we just redraw
  shouldComponentUpdate: () -> false

  componentWillUnmount: () ->


  ##############################
  ### Custom Methods         ###
  ##############################


# Export to make available
module.exports = ImageEditor
