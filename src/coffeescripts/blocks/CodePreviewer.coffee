###* @jsx React.DOM ###

##############################
### Includes and Constants ###
##############################
Channel = postal.channel("makona")
require("script!../../../vendor/prettify.js")


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


CodePreviewer = React.createClass

  ##############################
  ### Construction           ###
  ##############################
  displayName: "CodePreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    html = prettyPrintOne(this.props.block.data.text, this.props.block.data.lang)
    `(
      <div className="mk-block-content" >
        <div className="mk-block-label">{this.props.block.data.lang}</div>
        <pre><code dangerouslySetInnerHTML={{__html: html}}></code></pre>
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
module.exports = CodePreviewer
