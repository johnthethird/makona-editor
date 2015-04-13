###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


TextPreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "TextPreviewer"
  propTypes:
    block: React.PropTypes.object.isRequired


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `<pre>{this.props.block.data.text}</pre>`


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
module.exports = TextPreviewer
