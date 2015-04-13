###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


ScreencastEditor = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "ScreencastEditor"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div>
        Screencast
      </div>
    )`


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
module.exports = ScreencastEditor
