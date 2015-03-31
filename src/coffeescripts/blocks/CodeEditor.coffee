###* @jsx React.DOM ###

ExpandingTextarea = require("../tags/ExpandingTextarea")

CodeEditor = React.createClass
  displayName: "CodeEditor"
  handleChange: ->
    lang = this.refs.lang.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {lang: lang}})
  render: ->
    `(
      <div className="mk-block-content" >
        <ExpandingTextarea {...this.props} />
        <br />
        <label>Language: </label><input value={this.props.block.data.lang} ref="lang" onChange={this.handleChange} />
      </div>
    )`

module.exports = CodeEditor
