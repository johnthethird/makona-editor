###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


UnknownPreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "UnknownPreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `<div className="mk-block-content" >
      <h4>Unknown Block Type: {this.props.block.type}</h4>
      <pre>{JSON.stringify(this.props.block.data, null, 2)}</pre>
    </div>`


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
module.exports = UnknownPreviewer
