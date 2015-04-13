###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################
ExpandingTextarea = require("../tags/ExpandingTextarea")


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


TextEditor = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "TextEditor"
  propTypes:
    block: React.PropTypes.object.isRequired


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `<ExpandingTextarea {...this.props} />`


  ##############################
  ### Life Cycle             ###
  ##############################
  # componentWillMount
  # componentDidMount
  # componentWillReceiveProps
  # shouldComponentUpdate
  # componentWillUpdate
  # componentDidUpdate
  # componentWillUnmount


  ##############################
  ### Custom Methods         ###
  ##############################


# Export to make available
module.exports = TextEditor
