`/** @jsx React.DOM */`


CodeEditor = React.createClass
  handleChange: ->
    text = this.refs.text.getDOMNode().value
    lang = this.refs.lang.getDOMNode().value
    this.props.handleChange({id: this.props.block.id, data: {text: text, lang: lang}})
  render: ->
    `(
      <div>
        <textarea value={this.props.block.data.text} ref="text" onChange={this.handleChange}></textarea>
        <br />
        <label>Language: </label><input value={this.props.block.data.lang} ref="lang" onChange={this.handleChange} />
      </div>
    )`

module.exports = CodeEditor