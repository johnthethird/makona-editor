###* @jsx React.DOM ###
Channel = postal.channel("makona")

ExpandingTextarea = require("../tags/ExpandingTextarea")

CodeEditor = React.createClass
  displayName: "CodeEditor"
  propTypes:
    block: React.PropTypes.object.isRequired

  render: ->
    `(
      <div className="mk-block-content" >
        <ExpandingTextarea {...this.props} ref="text" />
        <br />
        <label>Language: </label><input value={this.props.block.data.lang} ref="lang" onChange={this.handleLangChange} />
      </div>
    )`


  handleLangChange: (e) ->
    @refs.text.props.lang = @refs.lang.props.value
    Channel.publish "block.change", {block: this.props.block}

  handleChange: ->
    lang = this.refs.lang.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {lang: lang}})

module.exports = CodeEditor
