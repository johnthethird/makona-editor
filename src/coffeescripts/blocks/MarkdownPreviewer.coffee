###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################
marked = require("marked")
marked.setOptions
  gfm:          true
  tables:       true
  breaks:       true
  pedantic:     true
  sanitize:     true
  smartLists:   true
  smartypants:  false


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


MarkdownPreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "MarkdownPreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    html = marked(@props.block.data.text)
    `<div className="mk-block-content" dangerouslySetInnerHTML={{__html: html}}></div>`


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
module.exports = MarkdownPreviewer
