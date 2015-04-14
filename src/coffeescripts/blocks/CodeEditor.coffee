###* @jsx React.DOM ###

##############################
### Includes and Constants ###
##############################
Channel           = postal.channel("makona")
ExpandingTextarea = require("../tags/ExpandingTextarea")
require("script!../../../vendor/highlight.min.js")


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
        <ExpandingTextarea {...this.props} ref="text" onChange={this.handleChange} />
        <br />
        <label>Language: </label>
        <select value={this.props.block.data.lang} ref="lang" onChange={this.handleLangChange}>
          {this.options()}
        </select>
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

  languages: ->
    hljs.listLanguages()

  options: ->
    all_options = []
    for language, i in @languages()
      all_options.push `<option key={i} value={language}>{language}</option>`
    all_options

  handleLangChange: (e) ->
    newBlock = _.extend {}, @props.block, { data: { lang: @refs.lang.getDOMNode().value, text: @props.block.data.text } }
    Channel.publish "block.change", { block: newBlock }


# Export to make available
module.exports = CodeEditor
