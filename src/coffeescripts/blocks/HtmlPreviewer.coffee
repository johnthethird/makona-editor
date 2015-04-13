###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


HtmlPreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "HtmlPreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    html = this.props.block.data.text
    `<div  className="mk-block-content" dangerouslySetInnerHTML={{__html: html}}></div>`


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
module.exports = HtmlPreviewer
