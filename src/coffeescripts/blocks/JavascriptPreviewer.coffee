###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


JavascriptPreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "JavascriptPreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    js = this.props.block.data.text

    # Dont actually run the JS in preview mode.
    `<pre ref='js'>{js}</pre>`


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
module.exports = JavascriptPreviewer
