###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################
ExpandingTextarea = require("../tags/ExpandingTextarea")


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


HtmlEditor = React.createClass

  ##############################
  ### Construction           ###
  ##############################
  displayName: "HtmlEditor"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(<div className="mk-block-content">
       <ExpandingTextarea {...this.props} />
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
module.exports = HtmlEditor
