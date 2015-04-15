###* @jsx React.DOM ###

##############################
### Includes and Constants ###
##############################
DocumentPreviewer = require("./DocumentPreviewer")

DocumentEditor = React.createClass

  ##############################
  ### Construction           ###
  ##############################
  displayName: "DocumentEditor"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div>
        { (this.props.block.data.title.length > 0) ? <DocumentPreviewer block={this.props.block} /> : <div ref='fineuploader'></div>}
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
module.exports = DocumentEditor
