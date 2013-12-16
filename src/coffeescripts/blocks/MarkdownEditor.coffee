`/** @jsx React.DOM */`

ExpandingTextarea = require("../tags/ExpandingTextarea")

MarkdownEditor = React.createClass

  render: ->
    `(
      <div>
        <div>
          <button onClick={this.wrapSelectedWith.bind(this, "**")}>Bold</button>
          <button onClick={this.wrapSelectedWith.bind(this, "*")}>Italic</button>
        </div>
        {this.transferPropsTo(<ExpandingTextarea ref="eta"></ExpandingTextarea>)}
      </div>
    )`

  wrapSelectedWith: (chars, e) ->
    e.preventDefault()
    {start, end} = this.refs['eta'].getSelection()
    if start isnt end
      {before, selected, after} = @getChunks(this.props.block.data.text, start, end)
      text = before + chars + selected + chars + after
      this.props.handleChange(id: this.props.block.id, data: {text: text})


  # {before: "", selected: "", after: ""}
  getChunks: (text="", start=0, end=0) ->
    before: if start is 0 then "" else text[0..start-1]
    selected: text[start..end-1]
    after: text[end..text.length]




module.exports = MarkdownEditor
