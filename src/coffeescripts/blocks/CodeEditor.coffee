###* @jsx React.DOM ###

##############################
### Includes and Constants ###
##############################
Channel           = postal.channel("makona")
ExpandingTextarea = require("../tags/ExpandingTextarea")


# Trigger re-render by sending new block up via the makona postal channel. Like so:
# ...
# newBlock = <block with changes>
# Channel.publish "block.change", { block: newBlock }


CodeEditor = React.createClass

  ##############################
  ### Construction           ###
  ##############################
  displayName: "CodeEditor"
  propTypes:
    block: React.PropTypes.object.isRequired


  ##############################
  ### Render                 ###
  ##############################
  render: ->
    `(
      <div className="mk-block-content" >
        <ExpandingTextarea {...this.props} ref="text" />
        <br />
        <label>Language: </label><input value={this.props.block.data.lang} ref="lang" onChange={this.handleLangChange} />
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

  handleLangChange: (e) ->
    @refs.text.props.lang = @refs.lang.props.value
    Channel.publish "block.change", {block: this.props.block}

  handleChange: ->
    lang = this.refs.lang.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {lang: lang}})


# Export to make available
module.exports = CodeEditor
