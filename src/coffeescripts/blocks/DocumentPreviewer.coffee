###* @jsx React.DOM ###

##############################
### Includes and Constants ###
##############################


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


DocumentPreviewer = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "DocumentPreviewer"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div className="mk-block-content">
        <a href={this.props.block.data.url} target="_blank" >
          <img src={"http://t1.development.kaleosoftware.com" + this.props.block.data.icon_url} /><span>{this.props.block.data.title}</span>
        </a>
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
module.exports = DocumentPreviewer
