###* @jsx React.DOM ###
Channel = postal.channel("makona")

ExpandingTextarea = require("../tags/ExpandingTextarea")

CodeEditor = React.createClass
  displayName: "CodeEditor"
  propTypes:
    block: React.PropTypes.object.isRequired

  handleLangChange: (e) ->
    newBlock = _.cloneDeep(this.props.block)
    newBlock.data.lang = e.target.value
    Channel.publish "block.change", {block: newBlock}

  handleChange: ->
    lang = this.refs.lang.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {lang: lang}})
  render: ->
    `(
      <div className="mk-block-content" >
        <ExpandingTextarea {...this.props} />
        <br />
        <label>Language: </label><input value={this.props.block.data.lang} ref="lang" onChange={this.handleLangChange} />
      </div>
    )`

module.exports = CodeEditor
