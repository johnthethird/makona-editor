###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


QuotePreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "QuotePreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div className="mk-block-content" >
        <pre>{this.props.block.data.text}</pre>
        By <i>{this.props.block.data.cite}</i>
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
module.exports = QuotePreviewer
