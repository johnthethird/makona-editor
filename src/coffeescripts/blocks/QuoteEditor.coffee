###* @jsx React.DOM ###


##############################
### Includes and Constants ###
##############################
ExpandingTextarea = require("../tags/ExpandingTextarea")


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


QuoteEditor = React.createClass


  ##############################
  ### Construction           ###
  ##############################
  displayName: "QuoteEditor"


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div className="mk-block-content" >
        <ExpandingTextarea {...this.props} />
        <br />
        <input value={this.props.block.data.cite} ref="cite" onChange={this.handleChange} />
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
  handleChange: ->
    cite = this.refs.cite.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {cite: cite}})


# Export to make available
module.exports = QuoteEditor
